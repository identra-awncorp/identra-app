// DEV-ONLY proof without a device: the APP's wiring (QR parser → container → SDK wallet → adapters
// → view-models) completes a real OpenID4VCI issuance over real HTTP against the SDK's own test
// issuer world (identra-sdk/packages/app/test-dist/helpers/world.js: sdk-server issuer, trust list
// and status list on 127.0.0.1, signed with the SDK's test PKI). Only the Expo native modules are
// fakes (SecureStore fake, expo-sqlite double on node:sqlite, in-memory files). The network path is
// the app's own HttpFetch with the development origin mapping, on Node's fetch.
const assert = require('node:assert/strict');
const { after, before, describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const { missing, world: sdkWorld, freePort } = require('./helpers/sdkWorld');
const { createWorld, startListener, rootDer, DIPLOMA } = sdkWorld ?? {};

const { certNetConfigOf, createWallet, TRUST_LIST_URL } = require('../.tmp-test/src/native/domain/wallet/walletContainer');
const { createGatewayHttpFetch, createWalletHttpFetch } = require('../.tmp-test/src/native/data/wallet/httpFetch');
const { createExpoRandomSource } = require('../.tmp-test/src/native/data/wallet/randomSource');
const { createDataKeySecretStorage, createWalletKeySecretStorage } = require('../.tmp-test/src/native/data/wallet/secretStorage');
const { createAsyncStorageSeenStore } = require('../.tmp-test/src/native/data/wallet/seenStore');
const { createSqliteCredentialRepository } = require('../.tmp-test/src/native/data/wallet/credentialRepository');
const { credentialOfferQrText, parseQrScanValue } = require('../.tmp-test/src/native/domain/scan/qrScan');
const { initialReceiveState, receiveReducer, runAccept, shouldClearPin, detailReducer, initialDetailState } = require('../.tmp-test/src/native/domain/wallet/walletFlows');
const { credentialDetailView, credentialListItems, offerView, shortIssuerId, statusSentenceKeys } = require('../.tmp-test/src/native/domain/wallet/walletViews');
const { translate } = require('../.tmp-test/src/native/i18n');
const { createFakeSecureStore } = require('./helpers/fakeSecureStore');
const { openExpoSqliteDouble } = require('./helpers/expoSqliteDouble');

let listener;
before(async () => {
  if (!missing) listener = await startListener(await freePort(47340, 47344));
});
after(() => listener?.close());

function memoryStorage() {
  const map = new Map();
  return { map, getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => void map.set(k, v) };
}

/** The app's container exactly as walletRuntime builds it, with Node stand-ins for the Expo modules. */
function appWallet(world, { fetch: platformFetch = (url, init) => fetch(url, init), dpki = false } = {}) {
  const phone = { secureStore: createFakeSecureStore(), db: openExpoSqliteDouble(), catalogue: null, plain: memoryStorage(), seen: memoryStorage() };
  phone.wallet = createWallet({
    random: createExpoRandomSource((a) => webcrypto.getRandomValues(a)),
    clock: world.clock,
    // Development build with EXPO_PUBLIC_IDENTRA_API_URL pointing at the local listener.
    fetch: createWalletHttpFetch({ fetch: platformFetch, apiUrl: listener.localOrigin, production: false }),
    seen: createAsyncStorageSeenStore(phone.seen),
    keySecrets: createWalletKeySecretStorage(phone.secureStore, { authenticationPrompt: () => 'prompt' }),
    dataKeySecrets: createDataKeySecretStorage(phone.secureStore),
    repository: createSqliteCredentialRepository(async () => phone.db),
    catalogueFile: { read: async () => phone.catalogue, write: async (t) => void (phone.catalogue = t) },
    plainStorage: phone.plain,
    trustedRoots: [rootDer()], // the SDK's TEST root; the app ships the DEMO root (pinnedRoots.ts)
    trustListUrl: TRUST_LIST_URL,
    // The DID path as walletRuntime wires it: validated configuration, the app's gateway fetch over
    // the SDK's fake CertNet gateway (an in-process stand-in for the platform fetch).
    certNet: dpki ? { ...certNetConfigOf({ gatewayUrl: world.gateway.base, network: 'local' }, { production: false }), fetch: createGatewayHttpFetch({ fetch: (url) => world.gateway.fetch(url), gatewayUrl: world.gateway.base }) } : null,
  });
  return phone;
}

describe('the app wallet receives and keeps a diploma from a real issuer (no device)', { skip: missing }, () => {
  it('scan → resolve → wrong PIN → right PIN → stored, listed, opened, checked, revoked, removed', async () => {
    const world = await createWorld(listener);
    const phone = appWallet(world);
    const { wallet, db, secureStore } = phone;
    const { offerUri: qr, txCode } = await world.offer();

    // The scanner's parser and hand-off.
    const scanned = parseQrScanValue(qr, world.clock.now().getTime());
    assert.equal(scanned.kind, 'credential-offer');
    const qrText = credentialOfferQrText(scanned.offerUri);

    let state = receiveReducer(initialReceiveState, { type: 'device-checked', ready: true });
    state = receiveReducer(state, { type: 'resolved', result: await wallet.offers.resolve(qrText) });
    assert.equal(state.phase, 'consent', JSON.stringify(state));
    const view = offerView(state.offer, 'vi');
    assert.deepEqual({ ...view, issuerOrigin: undefined }, { issuerName: 'Trường Mẫu', issuerId: null, issuerOrigin: undefined, documentNameKey: 'wallet.documentTypes.diploma', pin: { length: 6, numeric: true } });
    assert.equal(secureStore.state.items.size, 0, 'resolving creates no key');

    // A wrong PIN: back to the PIN field, PIN cleared, retry on the same offer.
    const wrong = txCode === '000000' ? '111111' : '000000';
    let next = receiveReducer(state, { type: 'submit' });
    const wrongResult = await wallet.offers.accept(next.offer, { txCode: wrong });
    const afterWrong = receiveReducer(next, { type: 'accepted', result: wrongResult });
    assert.equal(afterWrong.phase, 'consent');
    assert.equal(afterWrong.failure.code, 'TX_CODE_WRONG');
    assert.equal(shouldClearPin(next, afterWrong), true);
    assert.equal(secureStore.state.items.size, 0, 'no key after a wrong PIN');

    next = receiveReducer(afterWrong, { type: 'submit' });
    state = receiveReducer(next, { type: 'accepted', result: await wallet.offers.accept(next.offer, { txCode }) });
    assert.equal(state.phase, 'received', JSON.stringify(state));
    assert.equal(state.issuerName, 'Trường Mẫu (TEST)');

    // Stored sealed, with one biometric-protected key (+ marker) and the data key.
    const row = db.raw.prepare('SELECT ciphertext, vct, issuer, status_cache FROM credentials').get();
    for (const value of Object.values(DIPLOMA)) assert.equal(row.ciphertext.includes(value), false);
    assert.equal(row.status_cache, 'valid');
    assert.deepEqual(JSON.parse(phone.catalogue), { version: 1, items: [{ vct: row.vct, issuer: row.issuer }] });

    // The list as the screen shows it.
    const items = credentialListItems(await wallet.credentials.list(), 'vi');
    assert.equal(items.length, 1);
    assert.equal(items[0].issuerName, 'Trường Mẫu (TEST)');
    assert.equal(items[0].status, 'verified');
    assert.equal(translate('vi', items[0].nameKey), 'Bằng tốt nghiệp');

    // The detail, decrypted and displayable: seven fields, Vietnamese labels, display order.
    let detail = detailReducer(initialDetailState, { type: 'loaded', result: await wallet.credentials.get(state.credentialId) });
    assert.equal(detail.phase, 'loaded');
    const dv = credentialDetailView(detail.details, 'vi');
    assert.deepEqual(
      dv.fields.map((f) => [translate('vi', f.labelKey), f.value]),
      [
        ['Họ và tên', DIPLOMA.ho_ten],
        ['Ngày sinh', '03/02/2001'],
        ['Mã sinh viên', DIPLOMA.ma_sinh_vien],
        ['Ngành', DIPLOMA.nganh],
        ['Hạng tốt nghiệp', DIPLOMA.hang_tot_nghiep],
        ['Năm tốt nghiệp', DIPLOMA.nam_tot_nghiep],
        ['Số hiệu bằng', DIPLOMA.so_hieu_bang],
      ],
    );

    // "Kiểm tra lại": valid, then revoked once the issuer revokes and the list cache runs out.
    detail = detailReducer(detail, { type: 'refresh' });
    detail = detailReducer(detail, { type: 'refreshed', result: await wallet.credentials.refreshStatus(state.credentialId), checkedAt: world.clock.now().toISOString() });
    assert.equal(credentialDetailView(detail.details, 'vi').status, 'verified');
    await world.statusService.setStatus('truong-mau', 1, world.issued[0].statusIdx, 'revoked');
    world.clock.advance(901);
    detail = detailReducer(detail, { type: 'refresh' });
    detail = detailReducer(detail, { type: 'refreshed', result: await wallet.credentials.refreshStatus(state.credentialId), checkedAt: world.clock.now().toISOString() });
    const revoked = credentialDetailView(detail.details, 'vi');
    assert.equal(revoked.status, 'revoked');
    assert.equal(translate('vi', 'identity.detail.statuses.revoked.description'), 'Nơi cấp đã thu hồi giấy tờ này.');

    // "Xóa khỏi ví": row and key gone, the catalogue no longer lists it.
    detail = detailReducer(detail, { type: 'remove' });
    detail = detailReducer(detail, { type: 'removed', result: await wallet.credentials.remove(state.credentialId) });
    assert.equal(detail.phase, 'removed');
    assert.deepEqual(await wallet.credentials.list(), []);
    assert.equal([...secureStore.state.items.keys()].filter((k) => k.startsWith('identra.wallet.keys::')).length, 0);
    assert.deepEqual(JSON.parse(phone.catalogue).items, []);
  });

  /** The receive screen: reducer state + the screen's submit handler (runAccept) + the PIN in component state. */
  async function receiveScreen(wallet, qr) {
    const box = { state: receiveReducer(initialReceiveState, { type: 'device-checked', ready: true }) };
    box.state = receiveReducer(box.state, { type: 'resolved', result: await wallet.offers.resolve(credentialOfferQrText(parseQrScanValue(qr).offerUri)) });
    return { box, session: { get: () => box.state, dispatch: (e) => (box.state = receiveReducer(box.state, e)) } };
  }

  it('a cancelled fingerprint prompt after the right PIN completes on the same code (no second credential)', async () => {
    const world = await createWorld(listener);
    const phone = appWallet(world);
    const { offerUri: qr, txCode } = await world.offer();
    const { box, session } = await receiveScreen(phone.wallet, qr);
    phone.secureStore.state.cancelNextPrompt = true; // the person dismisses the prompt for the new key
    const answers = [];
    const wallet = { offers: { ...phone.wallet.offers, accept: async (o, i) => { const r = await phone.wallet.offers.accept(o, i); answers.push(r); return r; } } };
    await runAccept(session, wallet, txCode, 6);
    assert.deepEqual([answers[0].code, answers[0].retryable], ['USER_CANCELLED', true]);
    // With the SDK's codeRedeemed: "Thử lại" without the PIN. Without it (older SDK): the PIN step, PIN kept.
    assert.equal(box.state.phase, answers[0].codeRedeemed === true ? 'resume' : 'consent');
    await runAccept(session, wallet, txCode, 6);
    assert.equal(box.state.phase, 'received', JSON.stringify(answers));
    assert.equal(world.issued.length, 1, 'one credential issued for one code');
  });

  it('reviewer\'s network-loss sequence: the PIN request got no answer, the code still works, the retry receives it', async () => {
    const world = await createWorld(listener);
    let dropToken = true;
    const phone = appWallet(world, {
      fetch: async (url, init) => {
        if (dropToken && String(url).includes('/token')) {
          dropToken = false;
          throw new TypeError('fetch failed'); // no answer at all
        }
        return fetch(url, init);
      },
    });
    const { offerUri: qr, txCode } = await world.offer();
    const { box, session } = await receiveScreen(phone.wallet, qr);
    await runAccept(session, phone.wallet, txCode, 6);
    assert.deepEqual([box.state.phase, box.state.failure.code], ['consent', 'NETWORK_ERROR'], 'back to the PIN step, not "code spent"');
    assert.equal(translate('vi', box.state.failure.sentenceKey), 'Chưa gửi được mã tới nơi cấp, hãy thử lại. Mã PIN bạn đã nhập vẫn được giữ.');
    await runAccept(session, phone.wallet, txCode, 6); // the PIN stayed in the component
    assert.equal(box.state.phase, 'received', JSON.stringify(box.state));
    assert.equal(world.issued.length, 1);
  });

  it('refuses a QR code pointing anywhere but the Identra API origin, before any network call', async () => {
    const world = await createWorld(listener);
    const phone = appWallet(world);
    listener.requests.length = 0;
    const r = await phone.wallet.offers.resolve(credentialOfferQrText('https://issuer.example.vn/offers/1'));
    assert.deepEqual(r, { ok: false, code: 'URL_NOT_ALLOWED' });
    assert.deepEqual(listener.requests, []);
  });

  it('an offer from an issuer outside the pinned roots fails its checks and stores nothing', async () => {
    const world = await createWorld(listener);
    // The app's real pinned DEMO root: the SDK's test PKI does not chain to it.
    const phone = appWallet(world);
    const demoRooted = createWallet({ ...phoneDeps(phone, world), trustedRoots: undefined });
    const { offerUri: qr, txCode } = await world.offer();
    const resolved = await demoRooted.offers.resolve(credentialOfferQrText(parseQrScanValue(qr).offerUri));
    assert.equal(resolved.ok, true);
    let state = receiveReducer(receiveReducer(receiveReducer(initialReceiveState, { type: 'device-checked', ready: true }), { type: 'resolved', result: resolved }), { type: 'submit' });
    state = receiveReducer(state, { type: 'accepted', result: await demoRooted.offers.accept(resolved.offer, { txCode }) });
    assert.equal(state.phase, 'accept-failed');
    assert.equal(state.failure.code, 'CREDENTIAL_INVALID');
    assert.ok(state.failure.detailKey, 'names the failed check in plain words');
    assert.equal(translate('vi', state.failure.sentenceKey), 'Giấy tờ nhận được không qua được kiểm tra nên chưa được lưu.');
    assert.deepEqual(await demoRooted.credentials.list(), []);
    assert.equal([...phone.secureStore.state.items.keys()].some((k) => k.startsWith('identra.wallet.keys::')), false, 'the key made for it was deleted');
  });
});

describe('the app wallet receives a diploma from a DID issuer through CertNet (ADR-0020, fake gateway)', { skip: missing }, () => {
  /** The receive screen: reducer state + the screen's submit handler. */
  async function receiveScreen(wallet, qr) {
    const box = { state: receiveReducer(initialReceiveState, { type: 'device-checked', ready: true }) };
    box.state = receiveReducer(box.state, { type: 'resolved', result: await wallet.offers.resolve(credentialOfferQrText(parseQrScanValue(qr).offerUri)) });
    return { box, session: { get: () => box.state, dispatch: (e) => (box.state = receiveReducer(box.state, e)) } };
  }
  const keysOf = (phone) => [...phone.secureStore.state.items.keys()].filter((k) => k.startsWith('identra.wallet.keys::'));

  it('receives, stores the issuer DID, lists it without a name, and re-checks: valid, not checked (CertNet silent), no longer recognised', async () => {
    const world = await createWorld(listener, { did: {} });
    const did = world.didSigner.kid.split('#')[0];
    const phone = appWallet(world, { dpki: true });
    const { offerUri: qr, txCode } = await world.offer();
    const { box, session } = await receiveScreen(phone.wallet, qr);
    assert.equal(box.state.phase, 'consent', JSON.stringify(box.state));
    // Before acceptance: the SDK hands over the declared identifier, and the screen shows no name.
    assert.equal(box.state.offer.issuerDid, did);
    assert.deepEqual([offerView(box.state.offer, 'vi').issuerName, offerView(box.state.offer, 'vi').issuerId], [null, shortIssuerId(did)]);
    await runAccept(session, phone.wallet, txCode, 6);
    assert.deepEqual([box.state.phase, box.state.issuerDid, box.state.issuerName, box.state.keyAuthenticated], ['received', did, null, true], JSON.stringify(box.state));

    const row = phone.db.raw.prepare('SELECT issuer, issuer_did, status_cache FROM credentials').get();
    assert.deepEqual({ ...row }, { issuer: sdkWorld.DID_ISS, issuer_did: did, status_cache: 'valid' }, 'issuer stays the credential issuer URL');
    const [item] = credentialListItems(await phone.wallet.credentials.list(), 'vi');
    assert.deepEqual([item.trustPath, item.issuerName, item.issuerDid, item.status], ['did', 'truongdid0001', did, 'verified']);
    assert.equal(world.gateway.state.calls.every((u) => u.startsWith(world.gateway.base)), true);

    let detail = detailReducer(initialDetailState, { type: 'loaded', result: await phone.wallet.credentials.get(box.state.credentialId) });
    assert.deepEqual([detail.details.trustPath, detail.details.issuerName], ['did', null]);
    const refresh = async () => {
      detail = detailReducer(detail, { type: 'refresh' });
      detail = detailReducer(detail, { type: 'refreshed', result: await phone.wallet.credentials.refreshStatus(box.state.credentialId), checkedAt: world.clock.now().toISOString() });
      const view = credentialDetailView(detail.details, 'vi');
      return [view.status, statusSentenceKeys(view.status, view.trustPath, detail.refreshChecks)];
    };
    assert.deepEqual(await refresh(), ['verified', ['identity.detail.statuses.verified.description']]);
    world.gateway.state.tirDown = true;
    assert.deepEqual(await refresh(), ['unknown', ['wallet.didPath.TRUST_LIST_UNAVAILABLE']], 'not checked yet, never valid');
    world.gateway.state.tirDown = false;
    world.gateway.state.recognition = 'rejected';
    assert.deepEqual(await refresh(), ['invalid', ['identity.detail.statuses.invalid.description', 'wallet.didPath.ISSUER_NOT_TRUSTED']]);
    assert.equal(translate('vi', 'wallet.didPath.ISSUER_NOT_TRUSTED'), 'Nơi cấp hiện không được công nhận qua CertNet cho loại giấy tờ này.');
  });

  it('an issuer DID CertNet cannot resolve at receipt: nothing stored, "Thử lại" without the PIN verifies it again, one credential issued', async () => {
    const world = await createWorld(listener, { did: {} });
    const phone = appWallet(world, { dpki: true });
    const { offerUri: qr, txCode } = await world.offer();
    const { box, session } = await receiveScreen(phone.wallet, qr);
    const answers = [];
    const wallet = { offers: { ...phone.wallet.offers, accept: async (o, i) => (answers.push(i), phone.wallet.offers.accept(o, i)) } };
    world.gateway.state.down = true;
    await runAccept(session, wallet, txCode, 6);
    assert.deepEqual([box.state.phase, box.state.failure.code], ['resume', 'DID_RESOLUTION_UNAVAILABLE'], JSON.stringify(box.state));
    assert.deepEqual(await phone.wallet.credentials.list(), []);
    assert.equal(phone.db.raw.prepare('SELECT count(*) AS n FROM credentials').get().n, 0, 'nothing stored');
    assert.equal(keysOf(phone).length, 1, 'its key waits for the retry');

    world.gateway.state.down = false;
    await runAccept(session, wallet, '', 6); // the PIN field is not shown on resume
    assert.deepEqual(answers, [{ txCode }, {}], 'the PIN was sent once');
    assert.deepEqual([box.state.phase, box.state.keyAuthenticated], ['received', false]);
    assert.equal(world.issued.length, 1, 'no second credential request');
    assert.equal(phone.db.raw.prepare('SELECT count(*) AS n FROM credentials').get().n, 1);
  });

  it('a wallet without the DID path refuses a DID issuer\'s offer at resolve with its own message, before the PIN and without a key', async () => {
    const world = await createWorld(listener, { did: {} });
    const phone = appWallet(world);
    const { offerUri: qr } = await world.offer();
    listener.requests.length = 0;
    const { box } = await receiveScreen(phone.wallet, qr);
    assert.deepEqual([box.state.phase, box.state.failure.code, box.state.failure.action], ['resolve-failed', 'TRUST_PATH_UNSUPPORTED', 'scan-again']);
    assert.equal(translate('vi', box.state.failure.titleKey), 'Ví chưa nhận được giấy tờ này');
    assert.equal(translate('vi', box.state.failure.sentenceKey), 'Nơi cấp của giấy tờ này đăng ký trên CertNet, mà phiên bản ứng dụng này chưa dùng CertNet. Mã QR không có lỗi.');
    assert.ok(listener.requests.length > 0, 'the offer and metadata were read');
    assert.equal(listener.requests.some((r) => r.includes('token')), false, 'the code was not spent');
    assert.deepEqual(keysOf(phone), []);
    assert.deepEqual(world.gateway.state.calls, []);
  });

  it('a DID credential opened in a build without the DID path is "not checked", and the screen says the app cannot check it (CertNet was never asked)', async () => {
    const world = await createWorld(listener, { did: {} });
    const phone = appWallet(world, { dpki: true });
    const { offerUri: qr, txCode } = await world.offer();
    const { box, session } = await receiveScreen(phone.wallet, qr);
    await runAccept(session, phone.wallet, txCode, 6);
    assert.equal(box.state.phase, 'received', JSON.stringify(box.state));
    const withoutCertNet = createWallet(phoneDeps(phone, world));
    world.gateway.state.calls.length = 0;
    let detail = detailReducer(initialDetailState, { type: 'loaded', result: await withoutCertNet.credentials.get(box.state.credentialId) });
    detail = detailReducer(detail, { type: 'refresh' });
    detail = detailReducer(detail, { type: 'refreshed', result: await withoutCertNet.credentials.refreshStatus(box.state.credentialId), checkedAt: world.clock.now().toISOString() });
    const view = credentialDetailView(detail.details, 'vi');
    assert.deepEqual([view.status, statusSentenceKeys(view.status, view.trustPath, detail.refreshChecks)], ['unknown', ['wallet.didPath.unsupported']]);
    assert.deepEqual(world.gateway.state.calls, [], 'CertNet was not asked');
    assert.equal(/chưa trả lời/.test(translate('vi', 'wallet.didPath.unsupported')), false, 'never says CertNet did not answer');
  });
});

function phoneDeps(phone, world) {
  return {
    random: createExpoRandomSource((a) => webcrypto.getRandomValues(a)),
    clock: world.clock,
    fetch: createWalletHttpFetch({ fetch: (url, init) => fetch(url, init), apiUrl: listener.localOrigin, production: false }),
    seen: createAsyncStorageSeenStore(phone.seen),
    keySecrets: createWalletKeySecretStorage(phone.secureStore, { authenticationPrompt: () => 'prompt' }),
    dataKeySecrets: createDataKeySecretStorage(phone.secureStore),
    repository: createSqliteCredentialRepository(async () => phone.db),
    catalogueFile: { read: async () => phone.catalogue, write: async (t) => void (phone.catalogue = t) },
    plainStorage: phone.plain,
  };
}
