const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { VCT } = require('@identra/sdk-core');
const {
  claimSetChoice,
  formatCountdown,
  initialPresentState,
  presentationActivityEntry,
  presentReducer,
  purposeText,
  RETRY_LATER_CODES,
  secondsLeft,
  shareBlock,
} = require('../.tmp-test/src/native/domain/wallet/presentationFlow');
const { parsePersistedIdentityEnvelope, createPersistedIdentityEnvelope } = require('../.tmp-test/src/native/domain/app-store/appStatePersistence');
const { translate } = require('../.tmp-test/src/native/i18n');

const CLAIMS = { ho_ten: 'Nguyễn Văn A', ngay_sinh: '2001-02-03', ma_sinh_vien: 'SV123456', nganh: 'Khoa học máy tính', hang_tot_nghiep: 'Giỏi', nam_tot_nghiep: '2024', so_hieu_bang: 'B-0001' };
const SETS = [{ index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'] }, { index: 1, claims: ['ho_ten', 'nganh'] }];
const match = (id, claimSets = SETS) => ({ credentialId: id, vct: VCT.diploma, issuerName: 'Trường Mẫu (TEST)', claimSets });
const NOW = Date.parse('2026-11-19T10:00:00Z');
const request = (o = {}) => ({
  clientId: 'x509_hash:abc',
  verifier: { trusted: true, ten: 'Nhà Tuyển Dụng Mẫu (TEST)', maToChuc: 'VATVN-0100000005' },
  purpose: { vi: 'Ứng tuyển vị trí kỹ sư', en: 'Job application' },
  matches: [match('c1')],
  expiresAt: new Date(NOW + 300_000).toISOString(),
  ...o,
});
const untrusted = (o = {}) => request({ verifier: { trusted: false }, warning: 'VERIFIER_NOT_TRUSTED', purpose: 'Chúng tôi là ngân hàng nhà nước', ...o });
const resolved = (req) => presentReducer(initialPresentState, { type: 'resolved', result: { ok: true, request: req } });
const fail = (code) => ({ ok: false, code });
const t = (key, params) => translate('vi', key, params);

describe('sharing: resolving', () => {
  it('shows no consent at all after a failed verifier check, and tells "check later" apart from "unusable code"', () => {
    for (const code of ['CERT_CHAIN_UNTRUSTED', 'CERT_EXPIRED', 'CERT_NOT_YET_VALID', 'CERT_CHAIN_MALFORMED', 'CERT_CONSTRAINT_INVALID', 'CERT_KEY_NOT_ALLOWED', 'CLIENT_ID_MISMATCH', 'SIGNATURE_INVALID', 'ALG_NOT_ALLOWED', 'REQUEST_INVALID', 'REQUEST_EXPIRED', 'URL_NOT_ALLOWED']) {
      const s = presentReducer(initialPresentState, { type: 'resolved', result: fail(code) });
      assert.deepEqual([s.phase, s.retryLater, s.failure.code], ['refused', false, code], code);
      assert.equal('request' in s, false, `${code}: nothing of the request is kept`);
    }
    for (const code of ['TRUST_LIST_UNAVAILABLE', 'NETWORK_ERROR']) {
      const s = presentReducer(initialPresentState, { type: 'resolved', result: fail(code) });
      assert.deepEqual([s.phase, s.retryLater], ['refused', true], code);
      assert.equal(presentReducer(s, { type: 'retry' }).phase, 'resolving');
    }
    assert.ok(RETRY_LATER_CODES.has('DEVICE_LOCKED'), 'resolve will propagate key-store codes soon');
    const hard = presentReducer(initialPresentState, { type: 'resolved', result: fail('CLIENT_ID_MISMATCH') });
    assert.equal(presentReducer(hard, { type: 'retry' }), hard, 'an unusable code is not retried');
  });

  it('names the missing document when nothing in the wallet matches', () => {
    const s = resolved(request({ matches: [] }));
    assert.equal(s.phase, 'no-match');
    assert.equal(t(s.documentNameKey), 'Bằng tốt nghiệp');
    assert.equal(presentReducer(s, { type: 'decline' }).phase, 'declined');
  });

  it('starts on the verifier\'s first option with the first shareable document', () => {
    const s = resolved(request());
    assert.deepEqual([s.phase, s.credentialId, s.claimSetIndex, s.untrusted, s.expired], ['consent', 'c1', 0, null, false]);
  });
});

describe('sharing: what leaves the phone', () => {
  it('splits the chosen option into required, optional and withheld fields, with values', () => {
    const full = claimSetChoice(match('c1'), 0, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual(full.required.map((f) => f.name), ['ho_ten', 'nganh']);
    assert.deepEqual(full.optional.map((f) => f.name), ['hang_tot_nghiep', 'nam_tot_nghiep']);
    assert.deepEqual(full.withheld.map((f) => f.name), ['ngay_sinh', 'ma_sinh_vien', 'so_hieu_bang']);
    assert.deepEqual(full.required.map((f) => [t(f.labelKey), f.value]), [['Họ và tên', CLAIMS.ho_ten], ['Ngành', CLAIMS.nganh]]);
    assert.deepEqual(full.smaller, { index: 1, dropped: full.optional });
    assert.equal(full.fuller, null);

    const less = claimSetChoice(match('c1'), 1, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual(less.optional, []);
    assert.deepEqual(less.required.map((f) => f.name), ['ho_ten', 'nganh']);
    assert.deepEqual(less.withheld.map((f) => f.name), ['ngay_sinh', 'ma_sinh_vien', 'hang_tot_nghiep', 'nam_tot_nghiep', 'so_hieu_bang']);
    assert.equal(less.smaller, null);
    assert.deepEqual(less.fuller.added.map((f) => f.name), ['hang_tot_nghiep', 'nam_tot_nghiep']);
  });

  it('treats every field of a single option as required (the only way out is to decline)', () => {
    const only = claimSetChoice(match('c1', [SETS[1]]), 1, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual([only.required.length, only.optional.length, only.smaller, only.fuller], [2, 0, null, null]);
  });

  it('switches option only to one the document can satisfy', () => {
    let s = resolved(request());
    s = presentReducer(s, { type: 'select-claim-set', index: 1 });
    assert.equal(s.claimSetIndex, 1);
    assert.equal(presentReducer(s, { type: 'select-claim-set', index: 7 }), s);
  });

  it('shows the purpose only for a trusted verifier, only as plain short text', () => {
    assert.equal(purposeText(request(), 'vi'), 'Ứng tuyển vị trí kỹ sư');
    assert.equal(purposeText(request(), 'en'), 'Job application');
    assert.equal(purposeText(request({ purpose: 'Tuyển dụng' }), 'en'), 'Tuyển dụng');
    assert.equal(purposeText(untrusted(), 'vi'), null, 'never text from an unverified verifier');
    for (const purpose of [undefined, 42, ['x'], { vi: 7 }, 'x'.repeat(301), '   ']) assert.equal(purposeText(request({ purpose }), 'vi'), null);
  });
});

describe('sharing: choosing a document', () => {
  it('offers a chooser, selects a shareable one by default and blocks a revoked or suspended one', () => {
    let s = resolved(request({ matches: [match('revoked-one'), match('good-one')] }));
    assert.equal(s.credentialId, 'revoked-one');
    s = presentReducer(s, { type: 'statuses', statuses: { 'revoked-one': 'revoked', 'good-one': 'verified' } });
    assert.equal(s.credentialId, 'good-one', 'the shareable document is preselected');
    s = presentReducer(s, { type: 'select-document', credentialId: 'revoked-one' });
    assert.equal(shareBlock(s), 'revoked');
    assert.equal(presentReducer(s, { type: 'submit' }), s, 'a revoked document cannot be submitted');
    s = presentReducer(s, { type: 'refresh-status' });
    s = presentReducer(s, { type: 'status-refreshed', credentialId: 'revoked-one', status: 'verified' });
    assert.equal(shareBlock(s), null, 'check again can lift the block');
    assert.equal(presentReducer(s, { type: 'select-document', credentialId: 'missing' }), s);
  });

  it('keeps a single suspended document selected and blocked', () => {
    const s = presentReducer(resolved(request()), { type: 'statuses', statuses: { c1: 'suspended' } });
    assert.equal(shareBlock(s), 'suspended');
  });
});

describe('sharing: untrusted verifier', () => {
  it('needs a deliberate second step before anything can be sent', () => {
    let s = resolved(untrusted());
    assert.equal(s.untrusted, 'warning');
    assert.equal(shareBlock(s), 'untrusted');
    assert.equal(presentReducer(s, { type: 'submit' }), s, 'no submit from the warning');
    assert.equal(presentReducer(s, { type: 'confirm-untrusted' }), s, 'no confirmation without asking first');
    s = presentReducer(s, { type: 'share-untrusted' });
    assert.equal(s.untrusted, 'confirming');
    assert.equal(presentReducer(s, { type: 'submit' }), s, 'still no submit while confirming');
    assert.equal(presentReducer(s, { type: 'cancel-untrusted' }).untrusted, 'warning');
    s = presentReducer(s, { type: 'confirm-untrusted' });
    assert.equal(s.untrusted, 'confirmed');
    s = presentReducer(s, { type: 'submit' });
    assert.equal(s.phase, 'submitting');
    const sent = presentReducer(s, { type: 'submitted', result: { ok: true } });
    assert.equal(sent.verifierName, null, 'an unverified party is never named');
  });
});

describe('sharing: countdown and submit', () => {
  it('counts down and disables sharing at zero', () => {
    assert.equal(secondsLeft(new Date(NOW + 61_500).toISOString(), NOW), 62);
    assert.equal(secondsLeft(new Date(NOW - 1).toISOString(), NOW), 0);
    assert.equal(formatCountdown(272), '4:32');
    assert.equal(formatCountdown(5), '0:05');
    let s = resolved(request());
    s = presentReducer(s, { type: 'tick', nowMs: NOW + 299_000 });
    assert.equal(s.expired, false);
    s = presentReducer(s, { type: 'tick', nowMs: NOW + 300_000 });
    assert.equal(shareBlock(s), 'expired');
    assert.equal(presentReducer(s, { type: 'submit' }), s);
    const confirming = presentReducer(presentReducer(resolved(untrusted()), { type: 'share-untrusted' }), { type: 'tick', nowMs: NOW + 300_000 });
    assert.equal(confirming.untrusted, 'warning', 'an expired request drops the confirmation');
  });

  it('submits once: a second tap while sending changes nothing', () => {
    const submitting = presentReducer(resolved(request()), { type: 'submit' });
    assert.equal(submitting.phase, 'submitting');
    assert.equal(presentReducer(submitting, { type: 'submit' }), submitting);
    assert.equal(presentReducer(submitting, { type: 'decline' }), submitting, 'cannot decline what is being sent');
  });

  it('reports the outcome: sent, back to consent when nothing was sent, or a final failure', () => {
    const submitting = presentReducer(presentReducer(resolved(request()), { type: 'select-claim-set', index: 1 }), { type: 'submit' });
    const sent = presentReducer(submitting, { type: 'submitted', result: { ok: true } });
    assert.deepEqual(sent, { phase: 'sent', verifierName: 'Nhà Tuyển Dụng Mẫu (TEST)', credentialId: 'c1', claims: ['ho_ten', 'nganh'] });
    for (const code of ['USER_CANCELLED', 'DEVICE_LOCKED']) {
      const back = presentReducer(submitting, { type: 'submitted', result: fail(code) });
      assert.deepEqual([back.phase, back.failure.code, back.claimSetIndex], ['consent', code, 1], code);
    }
    for (const [code, action] of [['KEY_INVALIDATED', 'request-again'], ['KEY_NOT_FOUND', 'request-again'], ['VERIFIER_ERROR', 'close'], ['NETWORK_ERROR', 'retry'], ['REQUEST_EXPIRED', 'close'], ['REQUEST_INVALID', 'close'], ['STORAGE_ERROR', 'retry']]) {
      const failed = presentReducer(submitting, { type: 'submitted', result: fail(code) });
      assert.deepEqual([failed.phase, failed.failure.code, failed.failure.action], ['failed', code, action], code);
    }
  });
});

describe('sharing: the activity record', () => {
  it('names who, which document and which fields, never a value', () => {
    const entry = presentationActivityEntry({
      id: 'share-1', now: new Date(NOW), verifierName: 'Nhà Tuyển Dụng Mẫu (TEST)', credentialId: 'c1',
      documentNameKey: 'wallet.documentTypes.diploma', claims: ['ho_ten', 'nganh', 'hang_tot_nghiep'], outcome: 'success', t,
    });
    assert.deepEqual(entry, {
      id: 'share-1', timestamp: '2026-11-19T10:00:00.000Z', type: 'share', status: 'success',
      title: 'Đã chia sẻ Bằng tốt nghiệp', description: 'Họ và tên, Ngành, Hạng tốt nghiệp', partner: 'Nhà Tuyển Dụng Mẫu (TEST)',
      credentialId: 'c1', sharedClaims: ['ho_ten', 'nganh', 'hang_tot_nghiep'], unread: false,
    });
    const text = JSON.stringify(entry);
    for (const value of Object.values(CLAIMS)) assert.equal(text.includes(value), false, value);
    const unnamed = presentationActivityEntry({ id: 'x', now: new Date(NOW), verifierName: null, credentialId: 'c1', documentNameKey: 'wallet.documentTypes.diploma', claims: ['ho_ten'], outcome: 'failed', t });
    assert.deepEqual([unnamed.partner, unnamed.status, unnamed.title], ['Bên chưa được xác nhận', 'failed', 'Chia sẻ Bằng tốt nghiệp không thành công']);
  });

  it('is stored with the document link and field names, and anything value-like is dropped on load', () => {
    const base = { credentials: [], profile: { fullName: '', dob: '', studentId: '', school: '', nationalId: '', email: '', phone: '', address: '', did: '' }, settings: {} };
    const log = { id: 'share-1', timestamp: '2026-11-19T10:00:00.000Z', type: 'share', status: 'success', title: 'x', description: 'y', partner: 'z', credentialId: 'c1', sharedClaims: ['ho_ten', 'nganh'] };
    const round = parsePersistedIdentityEnvelope(createPersistedIdentityEnvelope({ ...base, logs: [log] }));
    assert.deepEqual(round.logs[0].sharedClaims, ['ho_ten', 'nganh']);
    assert.equal(round.logs[0].credentialId, 'c1');
    const tampered = parsePersistedIdentityEnvelope(createPersistedIdentityEnvelope({ ...base, logs: [{ ...log, sharedClaims: ['Nguyễn Văn A'] }] }));
    assert.equal('sharedClaims' in tampered.logs[0], false);
  });
});
