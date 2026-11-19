// DEV-ONLY proof without a device: the APP's wallet container (Expo modules faked, the app's own
// HttpFetch, SQLite double, SecureStore fake) receives a diploma from the SDK's test issuer and then
// presents it to the SDK's test verifier (sdk-server createPresentationVerifier, mounted on
// 127.0.0.1 by identra-sdk/packages/app/test-dist/helpers/world.js), driven through the app's QR
// parser and the sharing state machine. The verifier's session must hold exactly the chosen fields.
const assert = require('node:assert/strict');
const path = require('node:path');
const { after, before, describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const { missing, world: sdkWorld, freePort } = require('./helpers/sdkWorld');
const { createWorld, startListener, rootDer, DIPLOMA } = sdkWorld ?? {};

const { createWallet } = require('../.tmp-test/src/native/domain/wallet/walletContainer');
const { createWalletHttpFetch } = require('../.tmp-test/src/native/data/wallet/httpFetch');
const { createExpoRandomSource } = require('../.tmp-test/src/native/data/wallet/randomSource');
const { createDataKeySecretStorage, createWalletKeySecretStorage } = require('../.tmp-test/src/native/data/wallet/secretStorage');
const { createAsyncStorageSeenStore } = require('../.tmp-test/src/native/data/wallet/seenStore');
const { createSqliteCredentialRepository } = require('../.tmp-test/src/native/data/wallet/credentialRepository');
const { credentialOfferQrText, parseQrScanValue, presentationRequestQrText } = require('../.tmp-test/src/native/domain/scan/qrScan');
const { claimSetChoice, initialPresentState, presentationActivityEntry, presentReducer } = require('../.tmp-test/src/native/domain/wallet/presentationFlow');
const { translate } = require('../.tmp-test/src/native/i18n');
const { createFakeSecureStore } = require('./helpers/fakeSecureStore');
const { openExpoSqliteDouble } = require('./helpers/expoSqliteDouble');

let listener;
before(async () => {
  if (!missing) listener = await startListener(await freePort(47345, 47349));
});
after(() => listener?.close());

const memory = () => {
  const map = new Map();
  return { getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => void map.set(k, v) };
};

function appWallet(world) {
  const secureStore = createFakeSecureStore();
  const db = openExpoSqliteDouble();
  let catalogue = null;
  const wallet = createWallet({
    random: createExpoRandomSource((a) => webcrypto.getRandomValues(a)),
    clock: world.clock,
    fetch: createWalletHttpFetch({ fetch: (url, init) => fetch(url, init), apiUrl: listener.localOrigin, production: false }),
    seen: createAsyncStorageSeenStore(memory()),
    keySecrets: createWalletKeySecretStorage(secureStore, { authenticationPrompt: () => 'prompt' }),
    dataKeySecrets: createDataKeySecretStorage(secureStore),
    repository: createSqliteCredentialRepository(async () => db),
    catalogueFile: { read: async () => catalogue, write: async (t) => void (catalogue = t) },
    plainStorage: memory(),
    trustedRoots: [rootDer()], // the SDK's TEST root (the app ships the DEMO root)
  });
  return { wallet, secureStore };
}

/** A verifier session (sdk-server returns { ok, session } since 373a673). */
async function newSession(verifier) {
  const r = await verifier.createSession({ scenario: 'ung-tuyen' });
  assert.equal(r.ok, true, JSON.stringify(r));
  return r.session;
}

async function receiveDiploma(world, wallet) {
  const { offerUri, txCode } = await world.offer();
  const resolved = await wallet.offers.resolve(credentialOfferQrText(parseQrScanValue(offerUri).offerUri));
  assert.equal(resolved.ok, true, JSON.stringify(resolved));
  const accepted = await wallet.offers.accept(resolved.offer, { txCode });
  assert.equal(accepted.ok, true, JSON.stringify(accepted));
  return accepted.credentialId;
}

/** The scanner path: parse the verifier's QR, rebuild it for the SDK, resolve into the state machine. */
async function scanAndResolve(wallet, qr) {
  const scanned = parseQrScanValue(qr);
  assert.equal(scanned.kind, 'presentation-request', JSON.stringify(scanned));
  return presentReducer(initialPresentState, { type: 'resolved', result: await wallet.presentations.resolve(presentationRequestQrText(scanned)) });
}

describe('the app wallet presents a diploma to a real verifier (no device)', { skip: missing }, () => {
  it('trusted verifier: the person chooses "share less", the verifier receives exactly ho_ten and nganh', async () => {
    const world = await createWorld(listener);
    const verifier = await world.newVerifier();
    const { wallet } = appWallet(world);
    const credentialId = await receiveDiploma(world, wallet);
    const session = await newSession(verifier);
    listener.log.length = 0;

    let state = await scanAndResolve(wallet, session.qr);
    assert.equal(state.phase, 'consent', JSON.stringify(state));
    assert.deepEqual(state.request.verifier, { trusted: true, ten: world.verifierEntry.ten, maToChuc: world.verifierEntry.ma_to_chuc });
    assert.equal(state.credentialId, credentialId);
    assert.equal(state.claimSetIndex, 0, 'the verifier\'s first option is the default');

    // What the consent screen shows, with the values that would leave the phone.
    const details = await wallet.credentials.get(credentialId);
    const match = state.request.matches[0];
    const full = claimSetChoice(match, state.claimSetIndex, match.vct, details.credential.claims, 'vi');
    assert.deepEqual(full.required.map((f) => [translate('vi', f.labelKey), f.value]), [['Họ và tên', DIPLOMA.ho_ten], ['Ngành', DIPLOMA.nganh]]);
    assert.deepEqual(full.smaller.dropped.map((f) => f.name), ['hang_tot_nghiep', 'nam_tot_nghiep']);
    assert.ok(full.withheld.some((f) => f.name === 'ngay_sinh'), 'ngày sinh is listed as not shared');

    state = presentReducer(state, { type: 'select-claim-set', index: full.smaller.index });
    state = presentReducer(state, { type: 'submit' });
    assert.equal(state.phase, 'submitting');
    assert.equal(presentReducer(state, { type: 'submit' }), state, 'a second tap does nothing');
    const result = await wallet.presentations.submit(state.request, { credentialId: state.credentialId, claimSetIndex: state.claimSetIndex });
    state = presentReducer(state, { type: 'submitted', result });
    assert.deepEqual(state, { phase: 'sent', verifierName: world.verifierEntry.ten, credentialId, claims: ['ho_ten', 'nganh'] });

    // The verifier's side holds exactly the chosen fields; nothing else reached it.
    const done = await verifier.session(session.id);
    assert.equal(done.status, 'verified', JSON.stringify(done.result));
    assert.deepEqual(done.result.claims, { ho_ten: DIPLOMA.ho_ten, nganh: DIPLOMA.nganh });
    const verifierSide = JSON.stringify([done, listener.log.map((l) => l.body)]);
    for (const name of ['ngay_sinh', 'ma_sinh_vien', 'so_hieu_bang', 'hang_tot_nghiep']) assert.equal(verifierSide.includes(DIPLOMA[name]), false, name);

    // The local record names the fields, never their values.
    const entry = presentationActivityEntry({ id: 'share-1', now: world.clock.now(), verifierName: state.verifierName, credentialId, documentNameKey: 'wallet.documentTypes.diploma', claims: state.claims, outcome: 'success', t: (k, p) => translate('vi', k, p) });
    assert.equal(entry.description, 'Họ và tên, Ngành');
    for (const value of Object.values(DIPLOMA)) assert.equal(JSON.stringify(entry).includes(value), false);
  });

  it('untrusted verifier: refused without the double confirmation, accepted after it', async () => {
    // The wallet's trust list lacks the verifier; the server still trusts itself (as in the SDK's own test).
    const world = await createWorld(listener, { untrustedVerifier: true });
    const self = async () => ({ maToChuc: world.verifierEntry.ma_to_chuc, ten: world.verifierEntry.ten, mucDich: 'request' });
    const verifier = await world.newVerifier({ trustRegistry: { lookup: async (fp, at) => (fp === world.verifierEntry.chung_thu[0].sha256 ? self() : world.serverRegistry.lookup(fp, at)) } });
    const { wallet } = appWallet(world);
    const credentialId = await receiveDiploma(world, wallet);

    const first = await newSession(verifier);
    let state = await scanAndResolve(wallet, first.qr);
    assert.deepEqual([state.phase, state.untrusted, state.request.verifier.trusted], ['consent', 'warning', false]);
    assert.equal(presentReducer(state, { type: 'submit' }), state, 'the screen cannot submit from the warning');
    // The SDK refuses on its own as well.
    assert.deepEqual(await wallet.presentations.submit(state.request, { credentialId, claimSetIndex: 0 }), { ok: false, code: 'VERIFIER_NOT_TRUSTED' });

    const second = await newSession(verifier);
    state = await scanAndResolve(wallet, second.qr);
    state = presentReducer(presentReducer(state, { type: 'share-untrusted' }), { type: 'confirm-untrusted' });
    state = presentReducer(state, { type: 'submit' });
    const result = await wallet.presentations.submit(state.request, { credentialId, claimSetIndex: state.claimSetIndex, allowUntrusted: state.untrusted === 'confirmed' });
    state = presentReducer(state, { type: 'submitted', result });
    assert.equal(state.phase, 'sent');
    assert.equal(state.verifierName, null);
    assert.equal((await verifier.session(second.id)).status, 'verified');
  });

  it('a wallet without the requested document shows the no-match state; declining sends nothing', async () => {
    const world = await createWorld(listener);
    const verifier = await world.newVerifier();
    const { wallet } = appWallet(world);
    const session = await newSession(verifier);
    listener.log.length = 0;
    let state = await scanAndResolve(wallet, session.qr);
    assert.equal(state.phase, 'no-match');
    wallet.presentations.decline(state.request);
    state = presentReducer(state, { type: 'decline' });
    assert.equal(state.phase, 'declined');
    assert.equal(listener.log.some((l) => l.path.startsWith('/oid4vp/response/')), false);
    assert.notEqual((await verifier.session(session.id)).status, 'verified');
  });
});
