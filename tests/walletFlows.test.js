const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { VCT } = require('@identra/sdk-core');
const {
  abandonOffer,
  acceptInput,
  detailReducer,
  initialDetailState,
  initialReceiveState,
  initialRestoreState,
  receiveReducer,
  restoreReducer,
  runAccept,
  shouldClearPin,
} = require('../.tmp-test/src/native/domain/wallet/walletFlows');
const {
  credentialDetailView,
  credentialListItems,
  displayedValue,
  documentsToRequestViews,
  MASKED_VALUE,
  formatWalletDate,
  issuerLabel,
  offerView,
  sanitizePin,
} = require('../.tmp-test/src/native/domain/wallet/walletViews');

const ISS = 'https://api-identra.awncorp.vn/issuers/truong-mau';
const offer = {
  issuerUri: ISS,
  issuerDisplay: [{ name: 'Trường Mẫu', locale: 'vi' }, { name: 'Sample University', locale: 'en' }],
  configuration: { id: 'bang-tot-nghiep-v1', vct: VCT.diploma, display: [] },
  txCode: { length: 6, inputMode: 'numeric', description: null },
};
const resolvedOk = { type: 'resolved', result: { ok: true, offer } };
const fail = (code, checks) => ({ ok: false, code, ...(checks ? { checks } : {}) });

describe('receive flow', () => {
  const ready = receiveReducer(initialReceiveState, { type: 'device-checked', ready: true });
  const consent = receiveReducer(ready, resolvedOk);
  const accepting = receiveReducer(consent, { type: 'submit' });
  const translate = require('../.tmp-test/src/native/i18n').translate;

  it('checks the phone first, then goes checking → consent → accepting → received', () => {
    assert.equal(initialReceiveState.phase, 'checking-device');
    assert.equal(receiveReducer(initialReceiveState, resolvedOk), initialReceiveState, 'nothing is resolved before the device check');
    assert.equal(ready.phase, 'resolving');
    assert.deepEqual(consent, { phase: 'consent', offer, failure: null, attempt: 0 });
    assert.deepEqual(accepting, { phase: 'accepting', offer, attempt: 1, resuming: false, keyPrompt: true });
    const received = receiveReducer(accepting, { type: 'accepted', result: { ok: true, credentialId: 'c1', vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)' } });
    assert.deepEqual(received, { phase: 'received', credentialId: 'c1', vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)', issuerDid: null, issuerUri: ISS, status: 'valid', keyAuthenticated: true });
    // The lists were unreachable at receipt: kept, shown as "not checked yet" rather than failed.
    const unchecked = receiveReducer(accepting, { type: 'accepted', result: { ok: true, credentialId: 'c2', vct: VCT.diploma, issuerName: 'X', status: 'unknown' } });
    assert.equal(unchecked.status, 'unknown');
    // What the received screen says then: the lists (who is recognised, what is still valid) could not be read, not "its status".
    assert.match(translate('vi', 'wallet.receive.successLeadUnchecked'), /nơi cấp có được công nhận/);
    assert.match(translate('en', 'wallet.receive.successLeadUnchecked'), /whether the issuer is recognised/);
    assert.equal(/check its status|kiểm được trạng thái/.test(translate('en', 'wallet.receive.successLeadUnchecked') + translate('vi', 'wallet.receive.successLeadUnchecked')), false);
  });

  it('stops before any code is spent when the phone cannot protect a key', () => {
    const notReady = receiveReducer(initialReceiveState, { type: 'device-checked', ready: false });
    assert.equal(notReady.phase, 'device-not-ready');
    assert.equal(receiveReducer(notReady, resolvedOk), notReady);
    assert.equal(receiveReducer(notReady, { type: 'submit' }), notReady);
  });

  it('shows why a code cannot be opened, and lets a network failure be retried', () => {
    for (const [code, action] of [['OFFER_EXPIRED', 'contact-issuer'], ['OFFER_INVALID', 'scan-again'], ['TRUST_PATH_UNSUPPORTED', 'scan-again'], ['URL_NOT_ALLOWED', 'scan-again'], ['NETWORK_ERROR', 'retry']]) {
      const s = receiveReducer(ready, { type: 'resolved', result: fail(code) });
      assert.equal(s.phase, 'resolve-failed');
      assert.equal(s.failure.action, action, code);
    }
    const failed = receiveReducer(ready, { type: 'resolved', result: fail('NETWORK_ERROR') });
    assert.equal(receiveReducer(failed, { type: 'retry-resolve' }).phase, 'resolving');
  });

  it('keeps the offer after a wrong PIN and asks to clear the PIN (only then)', () => {
    const wrong = receiveReducer(accepting, { type: 'accepted', result: { ...fail('TX_CODE_WRONG'), retryable: true } });
    assert.equal(wrong.phase, 'consent');
    assert.equal(wrong.offer, offer);
    assert.equal(wrong.failure.code, 'TX_CODE_WRONG');
    assert.equal(shouldClearPin(accepting, wrong), true);
    assert.equal(shouldClearPin(consent, wrong), false, 'only the transition out of accepting clears it');
    assert.equal(shouldClearPin(accepting, { ...wrong, failure: null }), false);
    assert.equal(receiveReducer(wrong, { type: 'submit' }).attempt, 2);
  });

  const failed = (code, retryable, codeRedeemed, extra = {}) => ({ ...fail(code), retryable, ...(codeRedeemed === undefined ? {} : { codeRedeemed }), ...extra });

  it('routes a retryable failure with the code redeemed to "Thử lại" without the PIN', () => {
    for (const code of ['USER_CANCELLED', 'DEVICE_LOCKED', 'NETWORK_ERROR', 'STORAGE_ERROR']) {
      const resume = receiveReducer(accepting, { type: 'accepted', result: failed(code, true, true) });
      assert.deepEqual([resume.phase, resume.failure.action], ['resume', 'retry'], code);
    }
    const resume = receiveReducer(accepting, { type: 'accepted', result: failed('USER_CANCELLED', true, true) });
    assert.equal(resume.failure.sentenceKey, 'wallet.receive.resume.USER_CANCELLED');
    const again = receiveReducer(resume, { type: 'submit' });
    assert.deepEqual([again.phase, again.resuming], ['accepting', true]);
    assert.deepEqual(acceptInput(resume, '123456', 6), {}, 'no PIN is sent on resume');
    // The resolved offer can carry the flag too.
    const viaOffer = receiveReducer({ ...accepting, offer: { ...offer, codeRedeemed: true } }, { type: 'accepted', result: failed('USER_CANCELLED', true) });
    assert.equal(viaOffer.phase, 'resume');
  });

  it('routes a retryable failure with the code NOT redeemed back to the PIN step, truthfully, PIN kept', () => {
    const notSent = receiveReducer(accepting, { type: 'accepted', result: failed('NETWORK_ERROR', true, false) });
    assert.deepEqual([notSent.phase, notSent.failure.code], ['consent', 'NETWORK_ERROR']);
    assert.equal(translate('vi', notSent.failure.sentenceKey), 'Chưa gửi được mã tới nơi cấp, hãy thử lại. Mã PIN bạn đã nhập vẫn được giữ.');
    assert.equal(shouldClearPin(accepting, notSent), false, 'the PIN stays');
    assert.deepEqual(acceptInput(notSent, '123456', 6), { txCode: '123456' }, 'the PIN is sent again');
    // An SDK without the field: undefined reads as not redeemed.
    assert.equal(receiveReducer(accepting, { type: 'accepted', result: failed('NETWORK_ERROR', true) }).phase, 'consent');
    // A PIN was needed and none was given (local): the PIN step with its own sentence.
    const required = receiveReducer({ ...accepting, resuming: true }, { type: 'accepted', result: failed('TX_CODE_REQUIRED', true, false) });
    assert.deepEqual([required.phase, translate('vi', required.failure.titleKey)], ['consent', 'Cần nhập mã PIN']);
    assert.equal(shouldClearPin(accepting, required), false);
  });

  it('says the code is used only when it was redeemed or the issuer says it is gone; otherwise a new code is needed', () => {
    for (const code of ['USER_CANCELLED', 'DEVICE_LOCKED', 'NETWORK_ERROR', 'STORAGE_ERROR', 'KEY_INVALIDATED']) {
      const s = receiveReducer(accepting, { type: 'accepted', result: failed(code, false, true) });
      assert.deepEqual([s.phase, s.codeSpent, s.failure.action], ['accept-failed', true, 'contact-issuer'], code);
      assert.match(s.failure.sentenceKey, /^wallet\.receive\.afterPin\./, code);
      assert.equal(/chưa có gì thay đổi/.test(translate('vi', s.failure.sentenceKey)), false, `${code}: never "nothing changed"`);
    }
    const expired = receiveReducer(accepting, { type: 'accepted', result: failed('OFFER_EXPIRED', false, false) });
    assert.deepEqual([expired.phase, expired.codeSpent], ['accept-failed', true]);
    for (const result of [failed('ISSUER_ERROR', false, false), failed('NETWORK_ERROR', false), fail('ISSUER_ERROR')]) {
      const s = receiveReducer(accepting, { type: 'accepted', result });
      assert.deepEqual([s.phase, s.codeSpent, s.failure.action], ['accept-failed', false, 'contact-issuer'], JSON.stringify(result));
      assert.equal(/afterPin/.test(s.failure.sentenceKey), false);
    }
    assert.equal(receiveReducer(accepting, { type: 'accept-threw', code: 'USER_CANCELLED' }).codeSpent, false, 'a thrown error proves nothing about the code');
    assert.equal(receiveReducer(accepting, { type: 'accepted', result: failed('URL_NOT_ALLOWED', false, false) }).failure.action, 'scan-again');
  });

  it("submits through the screen's handler: the reducer's offer, the PIN only when complete, one call at a time", async () => {
    const calls = [];
    let release;
    const wallet = { offers: { accept: (o, input) => { calls.push([o, input]); return new Promise((r) => (release = r)); }, discard: async () => undefined } };
    const box = { state: consent };
    const session = { get: () => box.state, dispatch: (e) => (box.state = receiveReducer(box.state, e)) };
    await runAccept(session, wallet, '12', 6);
    assert.deepEqual(calls, [], 'an incomplete PIN submits nothing');
    const first = runAccept(session, wallet, '123456', 6);
    await runAccept(session, wallet, '123456', 6);
    assert.equal(calls.length, 1, 'a double tap accepts once');
    assert.deepEqual(calls[0], [offer, { txCode: '123456' }]);
    release({ ok: false, code: 'NETWORK_ERROR', retryable: true, codeRedeemed: true });
    await first;
    assert.equal(box.state.phase, 'resume');
    const second = runAccept(session, wallet, '123456', 6);
    release({ ok: true, credentialId: 'c1', vct: VCT.diploma, issuerName: 'X' });
    await second;
    assert.deepEqual(calls[1], [offer, {}], 'resume sends no PIN');
    assert.equal(box.state.phase, 'received');
  });

  it('discards an abandoned offer (token and waiting key), never a received one', () => {
    const discarded = [];
    const wallet = { offers: { discard: async (o) => void discarded.push(o) } };
    for (const s of [consent, accepting, receiveReducer(accepting, { type: 'accepted', result: failed('USER_CANCELLED', true, true) })]) abandonOffer(s, offer, wallet);
    abandonOffer(receiveReducer(accepting, { type: 'accepted', result: failed('ISSUER_ERROR', false, true) }), offer, wallet);
    assert.equal(discarded.length, 4);
    abandonOffer(receiveReducer(accepting, { type: 'accepted', result: { ok: true, credentialId: 'c1', vct: VCT.diploma, issuerName: 'X' } }), offer, wallet);
    abandonOffer(ready, null, wallet);
    assert.equal(discarded.length, 4);
  });

  it('ends with nothing saved when the credential failed its checks', () => {
    const invalid = receiveReducer(accepting, { type: 'accepted', result: fail('CREDENTIAL_INVALID', [{ id: 'signature', ok: false, code: 'SIGNATURE_INVALID' }]) });
    assert.equal(invalid.phase, 'accept-failed');
    assert.equal(invalid.failure.detailKey, 'wallet.errors.SIGNATURE_INVALID');
    for (const code of ['ISSUER_MISMATCH', 'CNF_MISMATCH', 'CLAIMS_INCOMPLETE', 'ISSUER_ERROR', 'URL_NOT_ALLOWED']) {
      assert.equal(receiveReducer(accepting, { type: 'accepted', result: fail(code) }).phase, 'accept-failed', code);
    }
  });

  it('ignores events that do not belong to the current phase (double taps, late answers)', () => {
    assert.equal(receiveReducer(accepting, { type: 'submit' }), accepting);
    assert.equal(receiveReducer(consent, { type: 'accepted', result: fail('TX_CODE_WRONG') }), consent);
    assert.equal(receiveReducer(consent, resolvedOk), consent);
  });

  it('describes the offer and keeps only what a PIN field may hold', () => {
    assert.deepEqual(offerView(offer, 'vi'), { issuerName: 'Trường Mẫu', issuerId: null, issuerOrigin: null, documentNameKey: 'wallet.documentTypes.diploma', pin: { length: 6, numeric: true } });
    assert.equal(offerView({ ...offer, issuerOrigin: 'https://api-identra.awncorp.vn' }, 'vi').issuerOrigin, 'api-identra.awncorp.vn');
    assert.equal(offerView({ ...offer, issuerOrigin: 'http://evil.example' }, 'vi').issuerOrigin, null);
    assert.equal(offerView(offer, 'en').issuerName, 'Sample University');
    assert.equal(offerView({ ...offer, issuerDisplay: [], txCode: null }, 'vi').pin, null);
    assert.equal(offerView({ ...offer, issuerDisplay: [] }, 'vi').issuerName, 'Trường Đại học Mẫu (DEMO)');
    // A CertNet issuer: its self-declared name is dropped, the complete identifier stands in (the screen shows the web address beside it).
    const certNet = offerView({ ...offer, issuerDid: 'did:certnet:testnet:4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8', issuerOrigin: 'https://api-identra.awncorp.vn' }, 'vi');
    assert.deepEqual([certNet.issuerName, certNet.issuerId, certNet.issuerOrigin], [null, '4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8', 'api-identra.awncorp.vn']);
    assert.equal(offerView({ ...offer, issuerDid: null }, 'vi').issuerId, null);
    assert.equal(offerView({ ...offer, txCode: { length: null, inputMode: 'numeric', description: null } }, 'vi').pin.length, 6);
    const pin = { length: 6, numeric: true };
    assert.equal(sanitizePin('12 34-56', pin), '123456');
    assert.equal(sanitizePin('1234567890', pin), '123456');
    assert.equal(sanitizePin('PIN: 98a76', pin), '9876');
    assert.equal(sanitizePin('ab12', { length: 4, numeric: false }), 'ab12');
    assert.equal(sanitizePin('123', null), '');
  });
});

describe('credential list and detail views', () => {
  const summaries = [
    { id: 'a', vct: VCT.diploma, issuerUri: ISS, issuerName: null, status: 'unavailable', statusCheckedAt: null, createdAt: '2026-11-02T03:00:00.000Z' },
    { id: 'b', vct: VCT.diploma, issuerUri: 'https://other.example.vn/issuers/x', issuerName: 'Đại học Khác', status: 'valid', statusCheckedAt: null, createdAt: '2026-11-18T03:00:00.000Z' },
    { id: 'c', vct: 'https://unknown/vct', issuerUri: 'https://third.example.vn/i', issuerName: null, status: null, statusCheckedAt: null, createdAt: '2026-10-01T03:00:00.000Z' },
  ];

  it('lists newest first with a name, issuer, date and status for each', () => {
    const items = credentialListItems(summaries, 'vi');
    assert.deepEqual(items.map((i) => i.id), ['b', 'a', 'c']);
    assert.deepEqual(items.map((i) => i.status), ['verified', 'unknown', 'unknown']);
    assert.deepEqual(items.map((i) => i.issuerName), ['Đại học Khác', 'Trường Đại học Mẫu (DEMO)', 'third.example.vn']);
    assert.equal(items[2].nameKey, 'wallet.documentTypes.unknown');
    assert.equal(items[0].receivedDate, formatWalletDate('2026-11-18T03:00:00.000Z', 'vi'));
  });

  it('formats dates per locale and survives bad input', () => {
    const d = new Date(2026, 1, 3, 12);
    assert.equal(formatWalletDate(d, 'vi'), '03/02/2026');
    assert.equal(formatWalletDate(d, 'en'), '2026-02-03');
    assert.equal(formatWalletDate(Math.floor(d.getTime() / 1000), 'vi'), '03/02/2026');
    assert.equal(formatWalletDate('not a date', 'vi'), '');
    assert.equal(formatWalletDate(null, 'vi'), '');
  });

  it('shows the seven fields in order, marks the sensitive ones and links the issuer', () => {
    const details = {
      ...summaries[0],
      issuerName: 'Trường Mẫu (TEST)',
      iat: 1763500000,
      claims: { so_hieu_bang: 'B-1', ho_ten: 'A', ngay_sinh: '2001-02-03', ma_sinh_vien: 'S', nganh: 'N', hang_tot_nghiep: 'G', nam_tot_nghiep: '2024', extra: 'x' },
    };
    const view = credentialDetailView(details, 'vi');
    assert.deepEqual(view.fields.map((f) => f.name), ['ho_ten', 'ngay_sinh', 'ma_sinh_vien', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep', 'so_hieu_bang']);
    assert.equal(view.fields[1].value, '03/02/2001');
    assert.deepEqual([...view.sensitiveFields], ['ngay_sinh', 'ma_sinh_vien', 'so_hieu_bang']);
    assert.equal(view.issuerName, 'Trường Mẫu (TEST)');
    assert.equal(view.portalUrl, 'https://identra.awncorp.vn/vi/school-portal');
    assert.equal(JSON.stringify(view).includes(details.id), true, 'the id is kept for navigation only');
    assert.equal(issuerLabel(ISS, null, 'en'), 'Sample University (DEMO)');
  });

  it('masks exactly the sensitive fields until revealed, and nothing when the setting is off', () => {
    const o = { sensitiveFields: ['ngay_sinh', 'so_hieu_bang'] };
    assert.equal(displayedValue({ name: 'ngay_sinh', value: '03/02/2001' }, { ...o, hideSensitive: true, revealed: false }), MASKED_VALUE);
    assert.equal(displayedValue({ name: 'ho_ten', value: 'A' }, { ...o, hideSensitive: true, revealed: false }), 'A');
    assert.equal(displayedValue({ name: 'ngay_sinh', value: '03/02/2001' }, { ...o, hideSensitive: true, revealed: true }), '03/02/2001');
    assert.equal(displayedValue({ name: 'so_hieu_bang', value: 'B-1' }, { ...o, hideSensitive: false, revealed: false }), 'B-1');
    assert.equal(MASKED_VALUE.includes('0'), false);
  });

  it('runs the detail screen: load, check again, remove, and their failures', () => {
    const details = { ...summaries[1], iat: 1, claims: {} };
    let s = detailReducer(initialDetailState, { type: 'loaded', result: { ok: true, credential: details } });
    assert.equal(s.phase, 'loaded');
    s = detailReducer(s, { type: 'refresh' });
    assert.equal(s.refreshing, true);
    assert.equal(detailReducer(s, { type: 'refresh' }), s, 'one check at a time');
    s = detailReducer(s, { type: 'refreshed', result: { ok: true, status: 'revoked' }, checkedAt: '2026-11-19T00:00:00Z' });
    assert.deepEqual([s.refreshing, s.details.status, s.details.statusCheckedAt], [false, 'revoked', '2026-11-19T00:00:00Z']);
    s = detailReducer(detailReducer(s, { type: 'refresh' }), { type: 'refreshed', result: fail('NETWORK_ERROR'), checkedAt: 'x' });
    assert.equal(s.refreshFailure.code, 'NETWORK_ERROR');
    assert.equal(s.details.status, 'revoked', 'a failed check keeps the last known status');
    s = detailReducer(detailReducer(s, { type: 'remove' }), { type: 'removed', result: fail('STORAGE_ERROR') });
    assert.equal(s.removeFailure.code, 'STORAGE_ERROR');
    assert.equal(detailReducer(detailReducer(s, { type: 'remove' }), { type: 'removed', result: { ok: true } }).phase, 'removed');
    assert.equal(detailReducer(initialDetailState, { type: 'loaded', result: fail('CREDENTIAL_NOT_FOUND') }).failure.action, 'close');
    assert.equal(detailReducer(initialDetailState, { type: 'failed', code: 'KEY_INVALIDATED' }).failure.action, 'request-again');
  });
});

describe('restore flow', () => {
  const items = [{ vct: VCT.diploma, issuer: ISS }, { vct: VCT.diploma, issuer: 'https://other.example.vn/i' }];

  it('asks for confirmation on a restored phone, then lists what to request again', () => {
    let s = restoreReducer(initialRestoreState, { type: 'loaded', startup: { kind: 'restored-device', unreadableCount: 2, toRequest: items } });
    assert.equal(s.phase, 'restored-device');
    s = restoreReducer(s, { type: 'confirm' });
    assert.equal(s.confirming, true);
    assert.equal(restoreReducer(s, { type: 'confirm' }), s);
    const failed = restoreReducer(s, { type: 'confirm-failed', code: 'DEVICE_LOCKED' });
    assert.deepEqual([failed.phase, failed.confirming, failed.failure.code], ['restored-device', false, 'DEVICE_LOCKED']);
    s = restoreReducer(s, { type: 'confirmed' });
    assert.deepEqual(s, { phase: 'to-request', items, justCleared: true });
    s = restoreReducer(s, { type: 'forgotten', key: JSON.stringify([VCT.diploma, ISS]) });
    assert.equal(s.items.length, 1);
  });

  it('shows a fresh install list, an empty list, and a load failure', () => {
    assert.equal(restoreReducer(initialRestoreState, { type: 'loaded', startup: { kind: 'ready', credentialCount: 0, toRequest: items } }).phase, 'to-request');
    assert.deepEqual(restoreReducer(initialRestoreState, { type: 'loaded', startup: { kind: 'ready', credentialCount: 3, toRequest: [] } }).items, []);
    assert.equal(restoreReducer(initialRestoreState, { type: 'load-failed', code: 'DEVICE_LOCKED' }).failure.action, 'retry');
    const views = documentsToRequestViews(items, 'vi');
    assert.deepEqual(views.map((v) => [v.issuerName, v.portalUrl]), [['Trường Đại học Mẫu (DEMO)', 'https://identra.awncorp.vn/vi/school-portal'], ['other.example.vn', null]]);
  });
});

describe('DID trust path (ADR-0020): receipt, views and re-check results', () => {
  const { documentChoices } = require('../.tmp-test/src/native/domain/wallet/presentationFlow');
  const { isTestNetworkIssuer, issuerIdText, issuerText, issuerViewOf, statusSentenceKeys, trustPathKey, ISSUER_ID_DENSE_MAX, ISSUER_ID_KEEP } = require('../.tmp-test/src/native/domain/wallet/walletViews');
  const translate = require('../.tmp-test/src/native/i18n').translate;
  const DID = 'did:certnet:mainnet:4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8';
  const DID_TEST = 'did:certnet:testnet:truongdid0001';
  const consent = receiveReducer(receiveReducer(initialReceiveState, { type: 'device-checked', ready: true }), resolvedOk);
  const accepting = receiveReducer(consent, { type: 'submit' });
  const check = (id, code = null, extra = {}) => ({ id, ok: code === null, code, ...extra });
  const unresolved = { ok: false, code: 'NETWORK_ERROR', retryable: true, codeRedeemed: true, checks: [check('structure'), check('did_resolution', 'DID_RESOLUTION_UNAVAILABLE'), check('signature', 'SKIPPED', { skipped: true })] };

  it('an unresolved issuer at receipt: its own sentence, retry without the PIN and without a key prompt, then received under the DID', async () => {
    const resume = receiveReducer(accepting, { type: 'accepted', result: unresolved });
    assert.deepEqual([resume.phase, resume.failure.code, resume.failure.action], ['resume', 'DID_RESOLUTION_UNAVAILABLE', 'retry']);
    assert.equal(resume.failure.sentenceKey, 'wallet.receive.resume.DID_RESOLUTION_UNAVAILABLE');
    const sentence = translate('vi', resume.failure.sentenceKey);
    assert.match(sentence, /CertNet chưa trả lời/);
    assert.match(sentence, /chưa lưu gì/);
    assert.match(sentence, /không cần nhập lại mã PIN/);
    assert.equal(/nơi cấp\. Khi/.test(sentence) || /Mất kết nối với nơi cấp/.test(sentence), false, 'not the issuer\'s network');
    assert.deepEqual(acceptInput(resume, '123456', 6), {}, 'no PIN on the retry');

    // The screen's submit: the SDK is called without a PIN, the attempt asks for no new key.
    const calls = [];
    const wallet = { offers: { accept: async (o, input) => (calls.push(input), { ok: true, credentialId: 'd1', vct: VCT.diploma, issuerName: 'Tên tự khai', issuerDid: DID, status: 'valid' }), discard: async () => undefined } };
    const box = { state: resume };
    const seen = [];
    await runAccept({ get: () => box.state, dispatch: (e) => (seen.push(receiveReducer(box.state, e)), (box.state = seen.at(-1))) }, wallet, '123456', 6);
    assert.deepEqual(calls, [{}]);
    assert.deepEqual([seen[0].phase, seen[0].keyPrompt], ['accepting', false]);
    assert.deepEqual(
      { phase: box.state.phase, issuerDid: box.state.issuerDid, issuerName: box.state.issuerName, keyAuthenticated: box.state.keyAuthenticated },
      { phase: 'received', issuerDid: DID, issuerName: null, keyAuthenticated: false },
      'never a name on the DID path, and no access-gate pass without a prompt',
    );
    const shown = issuerViewOf(box.state, 'vi');
    assert.deepEqual([shown.trustPath, shown.issuerName, trustPathKey(shown)], ['did', '4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8', 'wallet.trustPath.did']);

    // Other resumes still prompt (a new key), and a plain network loss keeps its own sentence.
    const cancelled = receiveReducer(accepting, { type: 'accepted', result: { ok: false, code: 'USER_CANCELLED', retryable: true, codeRedeemed: true } });
    assert.equal(receiveReducer(cancelled, { type: 'submit' }).keyPrompt, true);
    const offline = receiveReducer(accepting, { type: 'accepted', result: { ok: false, code: 'NETWORK_ERROR', retryable: true, codeRedeemed: true } });
    assert.equal(offline.failure.sentenceKey, 'wallet.receive.resume.NETWORK_ERROR');
  });

  it('a DID-path document never gets a display name, even when its issuer URL is a key of the known-issuer table', () => {
    assert.ok(require('../.tmp-test/src/native/domain/wallet/walletViews').knownIssuers[ISS], 'ISS is a key of the static map');
    const summary = { id: 'd', vct: VCT.diploma, issuerUri: ISS, issuerName: 'Trường Đại học Mẫu (DEMO)', trustPath: 'did', issuerDid: DID, status: 'valid', statusCheckedAt: null, createdAt: '2026-11-20T00:00:00Z' };
    for (const locale of ['vi', 'en']) {
      const [item] = credentialListItems([summary], locale);
      assert.deepEqual([item.trustPath, item.issuerName, item.issuerDid], ['did', '4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8', DID]);
      const view = credentialDetailView({ ...summary, iat: 1, claims: {} }, locale);
      assert.equal(view.issuerName, '4f9c2a7e1b3d8f60a5c4e2b9d7f1a3c8');
      const text = JSON.stringify([item, view]);
      for (const name of ['Trường Đại học Mẫu', 'Sample University', 'api-identra.awncorp.vn']) assert.equal(text.includes(name), false, `${locale}: ${name}`);
    }
    // The sharing screen's document card: the same rule on a PresentationMatch.
    const request = { matches: [{ credentialId: 'd', vct: VCT.diploma, issuerName: null, trustPath: 'did', issuerDid: DID_TEST, claimSets: [] }, { credentialId: 'x', vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)', trustPath: 'x509', issuerDid: null, claimSets: [] }] };
    const [didChoice, x509Choice] = documentChoices(request, { d: ISS, x: ISS }, 'vi');
    assert.deepEqual([didChoice.trustPath, didChoice.issuerName, didChoice.issuerDid], ['did', 'truongdid0001', DID_TEST]);
    assert.deepEqual([x509Choice.trustPath, x509Choice.issuerName], ['x509', 'Trường Mẫu (TEST)']);
    // X.509 is exactly as before: the trusted name, the table, the host.
    assert.deepEqual(credentialListItems([{ ...summary, trustPath: 'x509', issuerDid: null, issuerName: null }], 'vi')[0].issuerName, 'Trường Đại học Mẫu (DEMO)');
  });

  it('shows the issuer identifier by ONE rule: complete wherever a person relies on it, a long head and tail only on dense surfaces', () => {
    const t = (key, p) => translate('vi', key, p);
    const LONG = `did:certnet:mainnet:${'truongdaihocbachkhoahanoi-khoacongnghethongtin-2024-ba8c41f7e2d9'}`;
    assert.equal(LONG.split(':').pop().length, 64);
    assert.deepEqual([ISSUER_ID_KEEP, ISSUER_ID_DENSE_MAX], [20, 41]);
    // Complete: the whole identifier, however long.
    for (const did of [DID, DID_TEST, LONG, 'did:certnet:mainnet:a1b2c3d4e5f67890']) {
      const id = did.split(':').pop();
      assert.equal(issuerIdText(id, 'complete'), id);
      assert.equal(issuerViewOf({ issuerUri: ISS, issuerName: null, trustPath: 'did', issuerDid: did }, 'vi').issuerName, id);
      assert.equal(issuerText(issuerViewOf({ issuerUri: ISS, issuerName: null, trustPath: 'did', issuerDid: did }, 'vi'), t), `Mã nơi cấp ${id}`);
    }
    // Dense: whole up to 41 characters, else the first 20 and last 20 around "…".
    assert.equal(issuerIdText('x'.repeat(41), 'dense'), 'x'.repeat(41));
    const long = LONG.split(':').pop();
    assert.equal(issuerIdText(long, 'dense'), `${long.slice(0, 20)}…${long.slice(-20)}`);
    assert.equal(issuerText({ trustPath: 'did', issuerName: long }, t, 'dense'), 'Mã nơi cấp truongdaihocbachkhoa…in-2024-ba8c41f7e2d9');
    // The reviewer's look-alike pairs (same first 8 and last 6 characters) read differently on every surface.
    for (const [a, b] of [['truongdaihocbachkhoahanoi', 'truongdakemchatluongahanoi'], ['a1b2c3d4e5f67890', 'a1b2c3ffffff7890']]) {
      for (const surface of ['complete', 'dense']) {
        const [ta, tb] = [a, b].map((id) => issuerText(issuerViewOf({ issuerUri: ISS, issuerName: null, trustPath: 'did', issuerDid: `did:certnet:mainnet:${id}` }, 'vi'), t, surface));
        assert.notEqual(ta, tb, `${surface}: ${a} / ${b}`);
        assert.deepEqual([ta, tb], [`Mã nơi cấp ${a}`, `Mã nơi cấp ${b}`]);
      }
    }
    assert.equal(issuerText({ trustPath: 'x509', issuerName: 'Trường Mẫu' }, t, 'dense'), 'Trường Mẫu');
  });

  it('names how the issuer is looked up, never whether the check passed (the status pill says that), and flags a test network', () => {
    const t = (key, p) => translate('vi', key, p);
    const en = (key) => translate('en', key);
    assert.equal(t(trustPathKey({ trustPath: 'x509', issuerDid: null })), 'Nơi cấp nhận diện qua chứng nhận số');
    assert.equal(t(trustPathKey({ trustPath: 'did', issuerDid: DID })), 'Nơi cấp tra cứu qua CertNet');
    assert.equal(t(trustPathKey({ trustPath: 'did', issuerDid: DID_TEST })), 'Nơi cấp tra cứu qua CertNet (mạng thử nghiệm)');
    assert.equal(en(trustPathKey({ trustPath: 'did', issuerDid: DID })), 'Issuer looked up through CertNet');
    for (const key of ['wallet.trustPath.x509', 'wallet.trustPath.did', 'wallet.trustPath.didTest']) {
      assert.equal(/xác minh|đã kiểm|checked|verified/i.test(`${t(key)} ${en(key)}`), false, `${key} claims an outcome`);
    }
    assert.deepEqual([isTestNetworkIssuer({ issuerDid: DID }), isTestNetworkIssuer({ issuerDid: 'did:certnet:local:x' }), isTestNetworkIssuer({ issuerDid: null })], [false, true, false]);
  });

  it('maps each re-check result to the right sentences: valid, not checked (CertNet silent), issuer no longer recognised', () => {
    const base = [check('structure'), check('did_resolution'), check('signature')];
    const tirDown = [...base, check('issuer_trust', 'TRUST_LIST_UNAVAILABLE'), check('status', 'SKIPPED', { skipped: true })];
    const resolverDown = [check('structure'), check('did_resolution', 'DID_RESOLUTION_UNAVAILABLE'), check('signature', 'SKIPPED', { skipped: true })];
    const rejected = [...base, check('issuer_trust', 'ISSUER_NOT_TRUSTED'), check('status', 'SKIPPED', { skipped: true })];
    assert.deepEqual(statusSentenceKeys('verified', 'did', base), ['identity.detail.statuses.verified.description']);
    assert.deepEqual(statusSentenceKeys('unknown', 'did', tirDown), ['wallet.didPath.TRUST_LIST_UNAVAILABLE']);
    assert.deepEqual(statusSentenceKeys('unknown', 'did', resolverDown), ['wallet.didPath.DID_RESOLUTION_UNAVAILABLE']);
    assert.deepEqual(statusSentenceKeys('invalid', 'did', rejected), ['identity.detail.statuses.invalid.description', 'wallet.didPath.ISSUER_NOT_TRUSTED']);
    // A build without CertNet configuration: unknown, and CertNet was never asked, so never "did not answer".
    const notConfigured = [check('structure'), check('did_resolution', 'DID_RESOLUTION_FAILED'), check('signature', 'SKIPPED', { skipped: true })];
    assert.deepEqual(statusSentenceKeys('unknown', 'did', notConfigured), ['wallet.didPath.unsupported']);
    assert.deepEqual(statusSentenceKeys('invalid', 'did', notConfigured), ['identity.detail.statuses.invalid.description', 'wallet.didPath.DID_RESOLUTION_FAILED'], 'with CertNet configured the same failure stays invalid');
    // Before any re-check (no checks): the DID path says CertNet or the issuer did not answer, never "the wallet could not reach the issuer".
    assert.deepEqual(statusSentenceKeys('unknown', 'did', null), ['wallet.didPath.notCheckedYet']);
    for (const locale of ['vi', 'en']) {
      const text = translate(locale, 'wallet.didPath.notCheckedYet');
      assert.match(text, /CertNet/, locale);
      assert.equal(/Ví chưa hỏi được nơi cấp|could not reach the issuer/.test(text), false, locale);
    }
    assert.deepEqual(statusSentenceKeys('unknown', 'x509', null), ['identity.detail.statuses.unknown.description']);
    // X.509 unchanged: unknown says only its meaning; invalid adds the failed check.
    const x509Down = [check('certificate_chain'), check('issuer_trust', 'TRUST_LIST_UNAVAILABLE')];
    assert.deepEqual(statusSentenceKeys('unknown', 'x509', x509Down), ['identity.detail.statuses.unknown.description']);
    assert.deepEqual(statusSentenceKeys('invalid', 'x509', [check('certificate_chain'), check('issuer_trust', 'ISSUER_NOT_TRUSTED')]), ['identity.detail.statuses.invalid.description', 'wallet.errors.ISSUER_NOT_TRUSTED']);
    for (const key of ['identity.detail.statuses.invalid.description', 'wallet.didPath.TRUST_LIST_UNAVAILABLE', 'wallet.didPath.ISSUER_NOT_TRUSTED', 'wallet.didPath.unsupported']) {
      for (const locale of ['vi', 'en']) assert.notEqual(translate(locale, key), key);
    }
    // "Not checked yet" is never shown as valid: the reducer keeps the SDK's status.
    let s = detailReducer(initialDetailState, { type: 'loaded', result: { ok: true, credential: { id: 'd', vct: VCT.diploma, issuerUri: ISS, issuerName: null, trustPath: 'did', issuerDid: DID, status: 'valid', statusCheckedAt: '2026-11-19T00:00:00Z', createdAt: 'x', iat: 1, claims: {} } } });
    s = detailReducer(detailReducer(s, { type: 'refresh' }), { type: 'refreshed', result: { ok: true, status: 'unknown', checks: tirDown, checkedAt: '2026-11-20T00:00:00Z', lastValidAt: '2026-11-19T00:00:00Z' }, checkedAt: 'x' });
    assert.deepEqual([credentialDetailView(s.details, 'vi').status, s.refreshChecks], ['unknown', tirDown]);
  });
});
