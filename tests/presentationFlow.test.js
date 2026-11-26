const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { VCT } = require('@identra/sdk-core');
const {
  claimSetChoice,
  createPresentationActions,
  shareOutcomeOf,
  submissionOf,
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
const { addActivityLogToAppState, expirePendingActivityLogsInAppState } = require('../.tmp-test/src/native/domain/app-store/appStoreStateService');
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
const resolved = (req, nowMs = NOW) => presentReducer(initialPresentState, { type: 'resolved', result: { ok: true, request: req }, nowMs });
const fail = (code) => ({ ok: false, code });
const t = (key, params) => translate('vi', key, params);

describe('sharing: resolving', () => {
  it('shows no consent at all after a failed verifier check, and tells "check later" apart from "unusable code"', () => {
    for (const code of ['CERT_CHAIN_UNTRUSTED', 'CERT_EXPIRED', 'CERT_NOT_YET_VALID', 'CERT_CHAIN_MALFORMED', 'CERT_CONSTRAINT_INVALID', 'CERT_KEY_NOT_ALLOWED', 'CLIENT_ID_MISMATCH', 'SIGNATURE_INVALID', 'ALG_NOT_ALLOWED', 'REQUEST_INVALID', 'REQUEST_EXPIRED', 'URL_NOT_ALLOWED']) {
      const s = presentReducer(initialPresentState, { type: 'resolved', result: fail(code), nowMs: NOW });
      assert.deepEqual([s.phase, s.retryLater, s.failure.code], ['refused', false, code], code);
      assert.equal('request' in s, false, `${code}: nothing of the request is kept`);
    }
    for (const code of ['TRUST_LIST_UNAVAILABLE', 'NETWORK_ERROR']) {
      const s = presentReducer(initialPresentState, { type: 'resolved', result: fail(code), nowMs: NOW });
      assert.deepEqual([s.phase, s.retryLater], ['refused', true], code);
      assert.equal(presentReducer(s, { type: 'retry' }).phase, 'resolving');
    }
    assert.ok(RETRY_LATER_CODES.has('DEVICE_LOCKED'), 'resolve will propagate key-store codes soon');
    const hard = presentReducer(initialPresentState, { type: 'resolved', result: fail('CLIENT_ID_MISMATCH'), nowMs: NOW });
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
    assert.deepEqual(full.options.map((o) => [o.index, o.first, o.fields.map((f) => f.name), o.added.length, o.dropped.map((f) => f.name)]), [
      [0, true, ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'], 0, []],
      [1, false, ['ho_ten', 'nganh'], 0, ['hang_tot_nghiep', 'nam_tot_nghiep']],
    ]);

    const less = claimSetChoice(match('c1'), 1, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual(less.optional, []);
    assert.deepEqual(less.required.map((f) => f.name), ['ho_ten', 'nganh']);
    assert.deepEqual(less.withheld.map((f) => f.name), ['ngay_sinh', 'ma_sinh_vien', 'hang_tot_nghiep', 'nam_tot_nghiep', 'so_hieu_bang']);
    assert.deepEqual(less.options[0].added.map((f) => f.name), ['hang_tot_nghiep', 'nam_tot_nghiep']);
    assert.deepEqual(less.options[0].dropped, []);
  });

  it('names exactly what each of several options sends, and can reach the middle one', () => {
    const three = [{ index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep', 'nam_tot_nghiep'] }, { index: 1, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep'] }, { index: 2, claims: ['ho_ten', 'nganh'] }];
    const choice = claimSetChoice(match('c1', three), 0, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual(choice.options.map((o) => o.fields.map((f) => f.name)), three.map((x) => x.claims));
    let s = resolved(request({ matches: [match('c1', three)] }));
    s = presentReducer(s, { type: 'select-claim-set', index: 1 });
    assert.deepEqual(submissionOf(s), { credentialId: 'c1', claimSetIndex: 1 });
    const middle = claimSetChoice(match('c1', three), 1, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual(middle.optional.map((f) => f.name), ['hang_tot_nghiep']);
  });

  it('shows both what is added and what is dropped should a non-nested option ever arrive', () => {
    const odd = [{ index: 0, claims: ['ho_ten', 'nganh', 'hang_tot_nghiep'] }, { index: 1, claims: ['ho_ten', 'ngay_sinh'] }];
    const choice = claimSetChoice(match('c1', odd), 0, VCT.diploma, CLAIMS, 'vi');
    const other = choice.options[1];
    assert.deepEqual(other.added.map((f) => f.name), ['ngay_sinh']);
    assert.deepEqual(other.dropped.map((f) => f.name), ['nganh', 'hang_tot_nghiep']);
    assert.deepEqual(choice.required.map((f) => f.name), ['ho_ten'], 'only what every option sends is required');
  });

  it('treats every field of a single option as required (the only way out is to decline)', () => {
    const only = claimSetChoice(match('c1', [SETS[1]]), 1, VCT.diploma, CLAIMS, 'vi');
    assert.deepEqual([only.required.length, only.optional.length, only.options.length], [2, 0, 1]);
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

  it('keeps a single suspended, invalid or expired document selected and blocked: nothing can be signed', () => {
    for (const status of ['suspended', 'invalid', 'expired', 'revoked']) {
      const s = presentReducer(resolved(request()), { type: 'statuses', statuses: { c1: status } });
      assert.equal(shareBlock(s), status, status);
      assert.equal(presentReducer(s, { type: 'submit' }), s, `${status}: no submit`);
    }
    for (const status of ['verified', 'unknown']) assert.equal(shareBlock(presentReducer(resolved(request()), { type: 'statuses', statuses: { c1: status } })), null, status);
  });

  it('switches away from a suspended document to one that can be shared', () => {
    for (const status of ['suspended', 'invalid']) {
      const s = presentReducer(resolved(request({ matches: [match('bad'), match('good')] })), { type: 'statuses', statuses: { bad: status, good: 'verified' } });
      assert.deepEqual([s.credentialId, shareBlock(s)], ['good', null], status);
    }
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
    assert.equal(shareBlock(s), 'request-expired');
    assert.equal(presentReducer(s, { type: 'submit' }), s);
    const confirming = presentReducer(presentReducer(resolved(untrusted()), { type: 'share-untrusted' }), { type: 'tick', nowMs: NOW + 300_000 });
    assert.equal(confirming.untrusted, 'warning', 'an expired request drops the confirmation');
  });

  it('treats a request already past its expiry as expired from the start, not from the first tick', () => {
    const late = resolved(request(), NOW + 301_000);
    assert.equal(shareBlock(late), 'request-expired');
    assert.equal(presentReducer(late, { type: 'submit' }), late);
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
    const unchecked = presentReducer(submitting, { type: 'submitted', result: fail('DID_RESOLUTION_UNAVAILABLE') });
    assert.deepEqual([unchecked.phase, unchecked.failure.code, unchecked.failure.action, unchecked.claimSetIndex], ['consent', 'DID_RESOLUTION_UNAVAILABLE', 'retry', 1]);
    for (const [code, action] of [['KEY_INVALIDATED', 'request-again'], ['KEY_NOT_FOUND', 'request-again'], ['VERIFIER_ERROR', 'scan-again'], ['NETWORK_ERROR', 'scan-again'], ['REQUEST_EXPIRED', 'close'], ['REQUEST_INVALID', 'close'], ['STORAGE_ERROR', 'retry']]) {
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
    const maybe = presentationActivityEntry({ id: 'y', now: new Date(NOW), verifierName: null, credentialId: 'c1', documentNameKey: 'wallet.documentTypes.diploma', claims: ['ho_ten'], outcome: 'uncertain', t });
    assert.deepEqual([maybe.status, maybe.title], ['uncertain', 'Có thể đã gửi Bằng tốt nghiệp']);
    // Only plain field names are kept as names; anything value-like is dropped from the record.
    const odd = presentationActivityEntry({ id: 'z', now: new Date(NOW), verifierName: null, credentialId: 'c1', documentNameKey: 'wallet.documentTypes.diploma', claims: ['ho_ten', 'Nguyễn Văn A', 'x'.repeat(41)], outcome: 'success', t });
    assert.deepEqual(odd.sharedClaims, ['ho_ten']);
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

describe('sharing: the screen\'s actions (what is really submitted)', () => {
  function screen(req, statuses) {
    const calls = { submit: [], requests: [], decline: 0 };
    let answer = { ok: true };
    let release = null;
    const wallet = {
      presentations: {
        submit: (r, choice) => {
          calls.submit.push(choice);
          calls.requests.push(r);
          return release === 'hold' ? new Promise((resolve) => (release = () => resolve(answer))) : Promise.resolve(answer);
        },
        decline: () => {
          calls.decline += 1;
          return { ok: true };
        },
      },
    };
    const box = { state: resolved(req) };
    if (statuses) box.state = presentReducer(box.state, { type: 'statuses', statuses });
    const session = { get: () => box.state, dispatch: (e) => (box.state = presentReducer(box.state, e)) };
    return { box, calls, actions: createPresentationActions(wallet, session), dispatch: session.dispatch, answer: (a) => (answer = a), hold: () => (release = 'hold'), release: () => release() };
  }

  it('sends allowUntrusted ONLY after the second confirmation', async () => {
    const trusted = screen(request());
    await trusted.actions.share();
    assert.deepEqual(trusted.calls.submit, [{ credentialId: 'c1', claimSetIndex: 0 }]);

    const u = screen(untrusted());
    assert.equal(await u.actions.share(), null, 'nothing from the warning');
    u.dispatch({ type: 'share-untrusted' });
    assert.equal(await u.actions.share(), null, 'nothing while confirming');
    assert.deepEqual(u.calls.submit, []);
    u.dispatch({ type: 'confirm-untrusted' });
    await u.actions.share();
    assert.deepEqual(u.calls.submit, [{ credentialId: 'c1', claimSetIndex: 0, allowUntrusted: true }]);
  });

  it('submits the reducer\'s selection: the chosen document and claim set', async () => {
    const s = screen(request({ matches: [match('a'), match('b')] }));
    s.dispatch({ type: 'select-document', credentialId: 'b' });
    s.dispatch({ type: 'select-claim-set', index: 1 });
    const attempt = await s.actions.share();
    assert.deepEqual(s.calls.submit, [{ credentialId: 'b', claimSetIndex: 1 }]);
    assert.deepEqual([attempt.outcome, attempt.credentialId, attempt.claims, attempt.documentNameKey], ['success', 'b', ['ho_ten', 'nganh'], 'wallet.documentTypes.diploma']);
  });

  it('submits at most once at a time (double tap)', async () => {
    const s = screen(request());
    s.hold();
    const first = s.actions.share();
    assert.equal(await s.actions.share(), null);
    assert.equal(s.calls.submit.length, 1);
    s.release();
    assert.equal((await first).outcome, 'success');
  });

  it('records the outcome: sent, may have been sent, failed, or nothing when back on the consent screen', async () => {
    for (const [result, outcome] of [[{ ok: true }, 'success'], [fail('NETWORK_ERROR'), 'uncertain'], [fail('VERIFIER_ERROR'), 'uncertain'], [fail('KEY_INVALIDATED'), 'failed'], [fail('REQUEST_EXPIRED'), 'failed']]) {
      const s = screen(request());
      s.answer(result);
      assert.equal((await s.actions.share()).outcome, outcome, JSON.stringify(result));
      assert.equal(shareOutcomeOf(s.box.state), outcome);
    }
    const cancelled = screen(request());
    cancelled.answer(fail('USER_CANCELLED'));
    assert.equal(await cancelled.actions.share(), null);
    assert.equal(cancelled.box.state.phase, 'consent');
  });

  /**
   * The SDK's submit for a DID-path document whose verifier cannot reach CertNet (sdk-app 835fa3c):
   * `answers` per send; a 503 is DID_RESOLUTION_UNAVAILABLE with `delivered`, the request pinned to
   * the first choice; another choice is REQUEST_INVALID (forgotten); the MAX_PRESENTATION_SENDS-th
   * 503 is VERIFIER_ERROR (forgotten); decline forgets it.
   */
  function sdkLike(answers) {
    const { MAX_PRESENTATION_SENDS } = require('@identra/sdk-app');
    const sent = [];
    let pinned = null;
    let open = true;
    return {
      sent,
      declined: () => !open,
      presentations: {
        async submit(_r, choice) {
          if (!open) return fail('REQUEST_INVALID');
          if (pinned && (pinned.credentialId !== choice.credentialId || pinned.claimSetIndex !== choice.claimSetIndex)) return (open = false), fail('REQUEST_INVALID');
          const answer = answers[Math.min(sent.length, answers.length - 1)];
          if (answer === 'cancel') return fail('USER_CANCELLED');
          sent.push(choice);
          open = false;
          if (answer === 'ok') return { ok: true };
          if (answer === '503' && sent.length < MAX_PRESENTATION_SENDS) return (open = true), (pinned = choice), { ok: false, code: 'DID_RESOLUTION_UNAVAILABLE', delivered: true };
          return fail(answer === '503' ? 'VERIFIER_ERROR' : answer);
        },
        decline: () => (open ? ((open = false), { ok: true }) : fail('REQUEST_INVALID')),
      },
    };
  }
  const historyAfter = async (answers, steps) => {
    const wallet = sdkLike(answers);
    const box = { state: resolved(request({ matches: [match('a'), match('b')] })) };
    const session = { get: () => box.state, dispatch: (e) => (box.state = presentReducer(box.state, e)) };
    let n = 0;
    const actions = createPresentationActions(wallet, session, () => `share-${++n}`);
    let app = { logs: [], settings: { flowSettings: { identity: { activityLogging: true } } } };
    const record = (a) => a && (app = addActivityLogToAppState(app, presentationActivityEntry({ id: a.recordId, now: new Date(NOW), verifierName: 'Nhà Tuyển Dụng Mẫu (TEST)', credentialId: a.credentialId, documentNameKey: a.documentNameKey, claims: a.claims, outcome: a.outcome, t })));
    session.dispatch({ type: 'select-document', credentialId: 'b' });
    session.dispatch({ type: 'select-claim-set', index: 1 });
    for (const step of steps) {
      if (step === 'share') record(await actions.share());
      else if (step === 'leave') actions.leave();
      else session.dispatch(step);
    }
    // A pending entry has no deadline: it never turns into "failed" by itself.
    app = expirePendingActivityLogsInAppState(app, NOW + 365 * 86_400_000, 'x');
    return { state: box.state, sent: wallet.sent, declined: wallet.declined(), logs: app.logs.map((l) => ({ id: l.id, status: l.status, title: l.title, description: l.description, sharedClaims: l.sharedClaims })) };
  };
  const SENT_ENTRY = { id: 'share-1', status: 'pending', title: 'Đã gửi Bằng tốt nghiệp, chưa có kết quả', description: 'Họ và tên, Ngành', sharedClaims: ['ho_ten', 'nganh'] };

  it('a requester that received the document but could not reach CertNet: the history says it was sent, the consent is locked to what was sent', async () => {
    const r = await historyAfter(['503'], ['share']);
    assert.deepEqual(r.logs, [SENT_ENTRY]);
    assert.deepEqual([r.state.phase, r.state.delivered, r.state.failure.code, r.state.credentialId, r.state.claimSetIndex], ['consent', true, 'DID_RESOLUTION_UNAVAILABLE', 'b', 1]);
    // Nothing that changes the selection works any more: another document, another claim set, a status that would pick another.
    let s = r.state;
    for (const e of [{ type: 'select-document', credentialId: 'a' }, { type: 'select-claim-set', index: 0 }, { type: 'statuses', statuses: { b: 'revoked', a: 'verified' } }]) s = presentReducer(s, e);
    assert.deepEqual([s.credentialId, s.claimSetIndex], ['b', 1]);
    assert.equal(shareBlock(s), 'revoked', 'a document that became blocked stops the resend instead of switching');
    assert.deepEqual(submissionOf(r.state), { credentialId: 'b', claimSetIndex: 1 });
    // A cancelled prompt on the resend: back to the same locked screen, the history unchanged.
    const cancelled = await historyAfter(['503', 'cancel'], ['share', 'share']);
    assert.deepEqual([cancelled.state.phase, cancelled.state.delivered, cancelled.state.failure.code, cancelled.sent.length], ['consent', true, 'USER_CANCELLED', 1]);
    assert.deepEqual(cancelled.logs, [SENT_ENTRY]);
  });

  it('history after a delivered share: a later success replaces the entry (counted once); a refusal, the last send or stopping leaves "sent, no result"', async () => {
    const success = await historyAfter(['503', 'ok'], ['share', { type: 'select-claim-set', index: 0 }, 'share']);
    assert.deepEqual(success.sent, [{ credentialId: 'b', claimSetIndex: 1 }, { credentialId: 'b', claimSetIndex: 1 }], 'sent again exactly as the first time');
    assert.equal(success.state.phase, 'sent');
    assert.deepEqual(success.logs, [{ ...SENT_ENTRY, status: 'success', title: 'Đã chia sẻ Bằng tốt nghiệp' }]);

    const stopped = await historyAfter(['503'], ['share', 'leave', { type: 'decline' }]);
    assert.deepEqual([stopped.state.phase, stopped.declined, stopped.logs], ['declined', true, [SENT_ENTRY]]);

    for (const [answers, code] of [[['503', 'REQUEST_INVALID'], 'REQUEST_INVALID'], [['503', 'NETWORK_ERROR'], 'NETWORK_ERROR'], [['503', 'REQUEST_EXPIRED'], 'REQUEST_EXPIRED']]) {
      const ended = await historyAfter(answers, ['share', 'share', 'share']);
      assert.deepEqual([ended.state.phase, ended.state.delivered, ended.state.failure.code], ['failed', true, code], code);
      assert.deepEqual(ended.logs, [SENT_ENTRY], `${code}: never "failed" or "may have been sent" for what the requester received`);
      assert.equal(ended.sent.length, answers.length, `${code}: the flow ended, no further send`);
    }
  });

  it('never loops: the SDK\'s last allowed send is VERIFIER_ERROR, which ends the flow with a truthful message', async () => {
    const { MAX_PRESENTATION_SENDS } = require('@identra/sdk-app');
    const r = await historyAfter(['503'], Array(MAX_PRESENTATION_SENDS + 2).fill('share'));
    assert.equal(r.sent.length, MAX_PRESENTATION_SENDS);
    assert.deepEqual([r.state.phase, r.state.failure.code, r.state.failure.action], ['failed', 'VERIFIER_ERROR', 'scan-again']);
    assert.deepEqual(r.logs, [SENT_ENTRY]);
    for (const locale of ['vi', 'en']) {
      const text = `${translate(locale, r.state.failure.titleKey)} ${translate(locale, r.state.failure.sentenceKey)}`;
      assert.match(text, locale === 'vi' ? /không còn dùng được.*đã nhận thông tin bạn gửi/ : /can no longer be used.*received what you sent/, locale);
      assert.equal(/chưa có gì được gửi|nothing (has been|was) sent|may have/i.test(text), false, `${locale}: "${text}"`);
    }
  });

  it('never submits a blocked document', async () => {
    const s = screen(request(), { c1: 'invalid' });
    assert.equal(await s.actions.share(), null);
    assert.deepEqual(s.calls.submit, []);
  });

  it('declines on leaving (back, unmount) only while the request is unanswered', async () => {
    const s = screen(request());
    s.actions.leave();
    assert.equal(s.calls.decline, 1);
    await s.actions.share();
    s.actions.leave();
    assert.equal(s.calls.decline, 1, 'an answered request is not declined');
    const none = screen(request({ matches: [] }));
    none.actions.leave();
    assert.equal(none.calls.decline, 1, 'the no-match state declines too');
  });
});
