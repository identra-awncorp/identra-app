const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { VCT } = require('@identra/sdk-core');
const {
  detailReducer,
  initialDetailState,
  initialReceiveState,
  initialRestoreState,
  receiveReducer,
  restoreReducer,
  shouldClearPin,
} = require('../.tmp-test/src/native/domain/wallet/walletFlows');
const {
  credentialDetailView,
  credentialListItems,
  documentsToRequestViews,
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
  const consent = receiveReducer(initialReceiveState, resolvedOk);
  const accepting = receiveReducer(consent, { type: 'submit' });

  it('goes checking → consent → accepting → received', () => {
    assert.equal(initialReceiveState.phase, 'resolving');
    assert.deepEqual(consent, { phase: 'consent', offer, failure: null, attempt: 0 });
    assert.deepEqual(accepting, { phase: 'accepting', offer, attempt: 1 });
    const received = receiveReducer(accepting, { type: 'accepted', result: { ok: true, credentialId: 'c1', vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)' } });
    assert.deepEqual(received, { phase: 'received', credentialId: 'c1', vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)' });
  });

  it('shows why a code cannot be opened, and lets a network failure be retried', () => {
    for (const [code, action] of [['OFFER_EXPIRED', 'contact-issuer'], ['OFFER_INVALID', 'scan-again'], ['URL_NOT_ALLOWED', 'scan-again'], ['NETWORK_ERROR', 'retry']]) {
      const s = receiveReducer(initialReceiveState, { type: 'resolved', result: fail(code) });
      assert.equal(s.phase, 'resolve-failed');
      assert.equal(s.failure.action, action, code);
    }
    const failed = receiveReducer(initialReceiveState, { type: 'resolved', result: fail('NETWORK_ERROR') });
    assert.equal(receiveReducer(failed, { type: 'retry-resolve' }).phase, 'resolving');
  });

  it('keeps the offer after a wrong PIN, asks to clear the PIN, and allows another try', () => {
    const wrong = receiveReducer(accepting, { type: 'accepted', result: fail('TX_CODE_WRONG') });
    assert.equal(wrong.phase, 'consent');
    assert.equal(wrong.offer, offer);
    assert.equal(wrong.failure.code, 'TX_CODE_WRONG');
    assert.equal(shouldClearPin(accepting, wrong), true);
    assert.equal(receiveReducer(wrong, { type: 'submit' }).attempt, 2);
    // A network failure keeps the PIN (the person did nothing wrong).
    const offline = receiveReducer(accepting, { type: 'accepted', result: fail('NETWORK_ERROR') });
    assert.equal(offline.phase, 'consent');
    assert.equal(shouldClearPin(accepting, offline), false);
    // A cancelled biometric prompt (thrown by the key store) is retryable too.
    assert.equal(receiveReducer(accepting, { type: 'accept-threw', code: 'USER_CANCELLED' }).phase, 'consent');
    assert.equal(receiveReducer(accepting, { type: 'accepted', result: fail('DEVICE_LOCKED') }).phase, 'consent');
    assert.equal(receiveReducer(accepting, { type: 'accepted', result: fail('KEY_INVALIDATED') }).phase, 'accept-failed');
  });

  it('ends with nothing saved when the offer expired or the credential failed its checks', () => {
    const expired = receiveReducer(accepting, { type: 'accepted', result: fail('OFFER_EXPIRED') });
    assert.equal(expired.phase, 'accept-failed');
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
    assert.deepEqual(offerView(offer, 'vi'), { issuerName: 'Trường Mẫu', documentNameKey: 'wallet.documentTypes.diploma', pin: { length: 6, numeric: true } });
    assert.equal(offerView(offer, 'en').issuerName, 'Sample University');
    assert.equal(offerView({ ...offer, issuerDisplay: [], txCode: null }, 'vi').pin, null);
    assert.equal(offerView({ ...offer, issuerDisplay: [] }, 'vi').issuerName, 'Trường Mẫu');
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
    assert.deepEqual(items.map((i) => i.issuerName), ['Đại học Khác', 'Trường Mẫu', 'third.example.vn']);
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
    assert.equal(view.portalUrl, 'https://www.identra.id.vn/vi/school-portal');
    assert.equal(JSON.stringify(view).includes(details.id), true, 'the id is kept for navigation only');
    assert.equal(issuerLabel(ISS, null, 'en'), 'Sample University');
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
    assert.deepEqual(views.map((v) => [v.issuerName, v.portalUrl]), [['Trường Mẫu', 'https://www.identra.id.vn/vi/school-portal'], ['other.example.vn', null]]);
  });
});
