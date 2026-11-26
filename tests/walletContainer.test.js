const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const { certNetConfigOf, createWallet, nextCatalogue, withIssuerNames, WalletConfigError, WalletStateError, CATALOGUE_FILE_NAME } = require('../.tmp-test/src/native/domain/wallet/walletContainer');
const { createSqliteCredentialRepository } = require('../.tmp-test/src/native/data/wallet/credentialRepository');
const { createExpoRandomSource } = require('../.tmp-test/src/native/data/wallet/randomSource');
const { createDataKeySecretStorage, createWalletKeySecretStorage } = require('../.tmp-test/src/native/data/wallet/secretStorage');
const { createAsyncStorageSeenStore } = require('../.tmp-test/src/native/data/wallet/seenStore');
const {
  credentialStatusFromVault,
  displayClaims,
  documentsToRequest,
  formatClaimDate,
} = require('../.tmp-test/src/native/domain/wallet/credentialPresentation');
const { parseCatalogue, DATA_KEY_NAME } = require('@identra/sdk-app');
const { VCT } = require('@identra/sdk-core');
const { translate } = require('../.tmp-test/src/native/i18n');
const backupPlugin = require('../plugins/withIdentraBackupRules');
const { createFakeSecureStore } = require('./helpers/fakeSecureStore');
const { openExpoSqliteDouble } = require('./helpers/expoSqliteDouble');

const DIPLOMA = VCT.diploma;
const ISSUER_A = 'https://dai-hoc-a.example.vn';
const ISSUER_B = 'https://dai-hoc-b.example.vn';

/** One "phone": the fake keychain, the SQLite file and the backed-up catalogue file. */
function createPhone({ secureStore = createFakeSecureStore(), db = openExpoSqliteDouble(), catalogueText = null } = {}) {
  const phone = { secureStore, db, catalogueText, failCatalogueWrites: false, plain: new Map() };
  phone.wallet = createWallet({
    random: createExpoRandomSource((a) => webcrypto.getRandomValues(a)),
    clock: { now: () => new Date('2026-11-19T00:00:00Z') },
    fetch: async () => {
      throw new Error('no network in this test');
    },
    seen: createAsyncStorageSeenStore({ getItem: async () => null, setItem: async () => undefined }),
    keySecrets: createWalletKeySecretStorage(secureStore, { authenticationPrompt: () => 'prompt' }),
    dataKeySecrets: createDataKeySecretStorage(secureStore),
    repository: createSqliteCredentialRepository(async () => db),
    plainStorage: { getItem: async (k) => phone.plain.get(k) ?? null, setItem: async (k, v) => void phone.plain.set(k, v) },
    catalogueFile: {
      read: async () => phone.catalogueText,
      write: async (text) => {
        if (phone.failCatalogueWrites) throw new Error('disk full');
        phone.catalogueText = text;
      },
    },
  });
  return phone;
}

async function receive(wallet, issuer, compact = 'h.p.s~d~') {
  const { keyId } = await wallet.keyStore.create();
  return wallet.vault.save({ compact, vct: DIPLOMA, issuer, keyId });
}

const items = (text) => parseCatalogue(text).items;

describe('wallet container', () => {
  it('signs with a per-credential key and stores the credential sealed', async () => {
    const { wallet, db } = createPhone();
    const a = await wallet.keyStore.create();
    const b = await wallet.keyStore.create();
    assert.notDeepEqual(a.publicJwk, b.publicJwk, 'one key per credential (ADR-0009 §2)');
    const signer = await wallet.keyStore.signer(a.keyId);
    const data = new TextEncoder().encode('kb-jwt signing input');
    const signature = await signer.sign(data);
    assert.equal(await wallet.verifier.verify(a.publicJwk, data, signature), true);

    const id = await wallet.vault.save({ compact: 'eyJ.secret.claims~', vct: DIPLOMA, issuer: ISSUER_A, keyId: a.keyId });
    assert.equal(db.raw.prepare('SELECT ciphertext FROM credentials').get().ciphertext.includes('secret'), false);
    assert.equal(await wallet.vault.open(id), 'eyJ.secret.claims~');
  });

  it('writes the backup catalogue after every vault change, with type and issuer only', async () => {
    const phone = createPhone();
    const id = await receive(phone.wallet, ISSUER_A, 'eyJ.CLAIM-VALUE.sig~');
    await receive(phone.wallet, ISSUER_A);
    await receive(phone.wallet, ISSUER_B);
    assert.deepEqual(items(phone.catalogueText), [
      { vct: DIPLOMA, issuer: ISSUER_A },
      { vct: DIPLOMA, issuer: ISSUER_B },
    ]);
    for (const forbidden of ['CLAIM-VALUE', id, 'key', 'ciphertext', '2026']) {
      assert.equal(phone.catalogueText.includes(forbidden), false, forbidden);
    }
    assert.equal(CATALOGUE_FILE_NAME, backupPlugin.CATALOGUE_FILE_NAME);

    // Removing one of two A copies keeps A; removing the B one drops B.
    const rows = await phone.wallet.vault.list();
    await phone.wallet.vault.removeWithKey(rows.find((r) => r.id === id).id, phone.wallet.keyStore);
    assert.equal(items(phone.catalogueText).length, 2);
    await phone.wallet.vault.remove(rows.find((r) => r.issuer === ISSUER_B).id);
    assert.deepEqual(items(phone.catalogueText), [{ vct: DIPLOMA, issuer: ISSUER_A }]);
  });

  it('never fails a vault change because the catalogue could not be written, and repairs it later', async () => {
    const phone = createPhone();
    phone.failCatalogueWrites = true;
    const id = await receive(phone.wallet, ISSUER_A);
    assert.ok(id);
    assert.equal(phone.catalogueText, null);
    phone.failCatalogueWrites = false;
    const state = await phone.wallet.getStartupState();
    assert.equal(state.kind, 'ready');
    assert.deepEqual(items(phone.catalogueText), [{ vct: DIPLOMA, issuer: ISSUER_A }]);
  });

  it('on a fresh install restored from a backup, lists the documents to request again', async () => {
    const oldPhone = createPhone();
    await receive(oldPhone.wallet, ISSUER_A);
    await receive(oldPhone.wallet, ISSUER_B);

    // New phone: only the catalogue came back (Android, or iOS when the database was not restored).
    const newPhone = createPhone({ catalogueText: oldPhone.catalogueText });
    let state = await newPhone.wallet.getStartupState();
    assert.deepEqual(state, { kind: 'ready', credentialCount: 0, toRequest: [{ vct: DIPLOMA, issuer: ISSUER_A }, { vct: DIPLOMA, issuer: ISSUER_B }] });

    // Re-issuing A must not erase B from the backed-up list.
    await receive(newPhone.wallet, ISSUER_A);
    state = await newPhone.wallet.getStartupState();
    assert.deepEqual(state.toRequest, [{ vct: DIPLOMA, issuer: ISSUER_B }]);
    assert.equal(items(newPhone.catalogueText).length, 2);

    // The user gives up on B.
    await newPhone.wallet.forgetDocument({ vct: DIPLOMA, issuer: ISSUER_B });
    assert.deepEqual((await newPhone.wallet.getStartupState()).toRequest, []);
    // A held document cannot be forgotten.
    await newPhone.wallet.forgetDocument({ vct: DIPLOMA, issuer: ISSUER_A });
    assert.deepEqual(items(newPhone.catalogueText), [{ vct: DIPLOMA, issuer: ISSUER_A }]);

    assert.deepEqual(documentsToRequest([{ vct: DIPLOMA, issuer: ISSUER_B }]), [
      { vct: DIPLOMA, issuer: ISSUER_B, nameKey: 'wallet.documentTypes.diploma', issuerName: 'dai-hoc-b.example.vn' },
    ]);
  });

  it('on a phone restored WITH the database but without the device-only data key, deletes nothing until acknowledged', async () => {
    const oldPhone = createPhone();
    await receive(oldPhone.wallet, ISSUER_A);
    await receive(oldPhone.wallet, ISSUER_B);

    // iOS restore: Documents/SQLite came back, the keychain items (THIS_DEVICE_ONLY) did not; no catalogue either.
    const restored = createPhone({ db: oldPhone.db, catalogueText: null });
    const state = await restored.wallet.getStartupState();
    assert.equal(state.kind, 'restored-device');
    assert.equal(state.unreadableCount, 2);
    assert.deepEqual(state.toRequest, [{ vct: DIPLOMA, issuer: ISSUER_A }, { vct: DIPLOMA, issuer: ISSUER_B }]);
    assert.equal((await restored.wallet.vault.list()).length, 2, 'nothing deleted without acknowledgement');
    assert.equal(await restored.wallet.getStartupState().then((s) => s.kind), 'restored-device');

    await restored.wallet.acknowledgeNewDevice();
    assert.deepEqual(await restored.wallet.vault.list(), []);
    assert.deepEqual(items(restored.catalogueText).length, 2, 'the dead rows stay listed for re-issuance');
    const after = await restored.wallet.getStartupState();
    assert.deepEqual(after, { kind: 'ready', credentialCount: 0, toRequest: state.toRequest });
    // A new credential gets a fresh data key.
    await receive(restored.wallet, ISSUER_A);
    assert.notEqual(await restored.secureStore.getItemAsync(DATA_KEY_NAME, { keychainService: 'identra.wallet.vault' }), null);
  });

  it('refuses acknowledgeNewDevice on a healthy wallet and propagates a locked keychain instead of guessing', async () => {
    const phone = createPhone();
    await receive(phone.wallet, ISSUER_A);
    await assert.rejects(phone.wallet.acknowledgeNewDevice(), WalletStateError);
    assert.equal((await phone.wallet.vault.list()).length, 1);

    phone.secureStore.state.locked = true;
    await assert.rejects(phone.wallet.getStartupState(), (e) => e.code === 'LOCKED');
    await assert.rejects(phone.wallet.acknowledgeNewDevice(), (e) => e.code === 'LOCKED');
    phone.secureStore.state.locked = false;
    assert.equal((await phone.wallet.vault.list()).length, 1);
  });

  it('computes the next catalogue as previous ∪ held − dropped-and-not-held', () => {
    const a = { vct: DIPLOMA, issuer: ISSUER_A };
    const b = { vct: DIPLOMA, issuer: ISSUER_B };
    assert.deepEqual(nextCatalogue(null, [b, a]).items, [a, b]);
    assert.deepEqual(nextCatalogue({ version: 1, items: [a] }, [b]).items, [a, b]);
    assert.deepEqual(nextCatalogue({ version: 1, items: [a, b] }, [], [b]).items, [a]);
    assert.deepEqual(nextCatalogue({ version: 1, items: [a, b] }, [b], [b]).items, [a, b]);
  });
});

describe('credential display metadata', () => {
  it('orders and labels diploma claims, formats ngay_sinh, and skips what is not disclosed', () => {
    const claims = { so_hieu_bang: 'QH-2024-001', ho_ten: 'Nguyễn Văn An', ngay_sinh: '2001-02-03', nganh: 'CNTT', iss: 'https://x', extra: 'x' };
    const vi = displayClaims(DIPLOMA, claims, 'vi');
    assert.deepEqual(vi.map((c) => c.name), ['ho_ten', 'ngay_sinh', 'nganh', 'so_hieu_bang']);
    assert.equal(vi[1].value, '03/02/2001');
    assert.equal(displayClaims(DIPLOMA, claims, 'en')[1].value, '2001-02-03');
    assert.deepEqual(vi.map((c) => translate('vi', c.labelKey)), ['Họ và tên', 'Ngày sinh', 'Ngành', 'Số hiệu bằng']);
    assert.deepEqual(displayClaims('https://other/vct', claims, 'vi'), []);
  });

  it('labels every diploma claim and document type in both locales', () => {
    const all = { ho_ten: 'a', ngay_sinh: '2000-01-01', ma_sinh_vien: 'b', nganh: 'c', hang_tot_nghiep: 'd', nam_tot_nghiep: 2024, so_hieu_bang: 'e' };
    for (const locale of ['vi', 'en']) {
      for (const claim of displayClaims(DIPLOMA, all, locale)) {
        assert.notEqual(translate(locale, claim.labelKey), claim.labelKey);
      }
      for (const key of ['wallet.documentTypes.diploma', 'wallet.documentTypes.productEvent', 'wallet.documentTypes.unknown']) {
        assert.notEqual(translate(locale, key), key);
      }
    }
    assert.equal(displayClaims(DIPLOMA, all, 'vi').length, 7);
  });

  it('formats only real calendar dates', () => {
    assert.equal(formatClaimDate('2000-02-29', 'vi'), '29/02/2000');
    for (const bad of ['2001-02-29', '2001-13-01', '01/02/2001', '2001-2-3', '']) assert.equal(formatClaimDate(bad, 'vi'), null, bad);
    // An unparseable date is shown as issued rather than dropped.
    assert.equal(displayClaims(DIPLOMA, { ngay_sinh: '03/02/2001' }, 'vi')[0].value, '03/02/2001');
  });

  it('maps the vault status cache onto the app statuses, with "not checked" for unavailable and null', () => {
    assert.equal(credentialStatusFromVault('valid'), 'verified');
    assert.equal(credentialStatusFromVault('revoked'), 'revoked');
    assert.equal(credentialStatusFromVault('suspended'), 'suspended');
    assert.equal(credentialStatusFromVault('unavailable'), 'unknown');
    assert.equal(credentialStatusFromVault(null), 'unknown');
    assert.equal(translate('vi', `common.status.${credentialStatusFromVault(null)}`), 'Chưa kiểm được trạng thái');
  });
});

describe('DID trust path configuration and names (ADR-0020)', () => {
  const prod = { production: true };
  const dev = { production: false };

  it('takes both CertNet values or neither, and refuses anything it cannot use', () => {
    assert.equal(certNetConfigOf({}, prod), null, 'neither: off, the wallet as before');
    assert.equal(certNetConfigOf({ gatewayUrl: '  ', network: '' }, prod), null);
    assert.deepEqual(certNetConfigOf({ gatewayUrl: ' https://gateway.certnet.vn ', network: 'testnet' }, prod), { gatewayUrl: 'https://gateway.certnet.vn', network: 'testnet' });
    assert.deepEqual(certNetConfigOf({ gatewayUrl: 'https://gw.example.vn/certnet', network: 'mainnet' }, prod), { gatewayUrl: 'https://gw.example.vn/certnet', network: 'mainnet' });
    assert.deepEqual(certNetConfigOf({ gatewayUrl: 'https://gw.example.vn', network: 'local' }, dev), { gatewayUrl: 'https://gw.example.vn', network: 'local' });
    const bad = [
      [{ gatewayUrl: 'https://gw.example.vn' }, prod],
      [{ network: 'testnet' }, prod],
      [{ gatewayUrl: 'https://gw.example.vn', network: 'devnet' }, prod],
      [{ gatewayUrl: 'https://gw.example.vn', network: 'TESTNET' }, prod],
      [{ gatewayUrl: 'https://gw.example.vn', network: 'local' }, prod],
      [{ gatewayUrl: 'http://gw.example.vn', network: 'testnet' }, dev],
      [{ gatewayUrl: 'gw.example.vn', network: 'testnet' }, dev],
      [{ gatewayUrl: 'https://gw.example.vn/?x=1', network: 'testnet' }, dev],
      [{ gatewayUrl: 'https://user@gw.example.vn', network: 'testnet' }, dev],
      [{ gatewayUrl: 'https://gw.example.vn/a/../b', network: 'testnet' }, dev],
    ];
    for (const [raw, options] of bad) assert.throws(() => certNetConfigOf(raw, options), (e) => e instanceof WalletConfigError && e.code === 'CERTNET_CONFIG_INVALID', JSON.stringify(raw));
  });

  it('builds the wallet with the DID path from a valid configuration (no request at start)', () => {
    let calls = 0;
    const phone = createPhone();
    const wallet = createWallet({ ...phoneDepsOf(phone), certNet: { gatewayUrl: 'https://gateway.certnet.vn', network: 'testnet', fetch: async () => (calls++, { status: 503, headers: { get: () => null }, text: async () => '' }) } });
    assert.equal(typeof wallet.offers.resolve, 'function');
    assert.equal(calls, 0);
  });

  it('never gives a DID-path document the name remembered for its issuer URL', async () => {
    const phone = createPhone();
    phone.plain.set('identra.wallet.issuer-names.v1', JSON.stringify({ [ISSUER_A]: 'Đại học A' }));
    const { keyId: k1 } = await phone.wallet.keyStore.create();
    const { keyId: k2 } = await phone.wallet.keyStore.create();
    const x = await phone.wallet.vault.save({ compact: 'h.p.s~d~', vct: DIPLOMA, issuer: ISSUER_A, keyId: k1 });
    const d = await phone.wallet.vault.save({ compact: 'h.p.s~d~', vct: DIPLOMA, issuer: ISSUER_A, issuerDid: 'did:certnet:testnet:abc', keyId: k2 });
    const byId = Object.fromEntries((await phone.wallet.credentials.list()).map((c) => [c.id, c]));
    assert.deepEqual([byId[x].trustPath, byId[x].issuerName], ['x509', 'Đại học A']);
    assert.deepEqual([byId[d].trustPath, byId[d].issuerDid, byId[d].issuerName], ['did', 'did:certnet:testnet:abc', null]);
  });
});

describe('the issuer-name cache and the known-issuer table on the DID path (ADR-0020)', () => {
  const KEY = 'identra.wallet.issuer-names.v1';
  const DID = 'did:certnet:mainnet:a1b2c3d4e5f67890';
  const storage = (initial = {}) => {
    const map = new Map([[KEY, JSON.stringify(initial)]]);
    return { map, writes: [], getItem: async (k) => map.get(k) ?? null, async setItem(k, v) { this.writes.push(v); map.set(k, v); } };
  };
  // An SDK that (wrongly) hands back a name for DID-path results: the cache must neither take nor give one.
  const sdk = {
    offers: { accept: async (offer) => ({ ok: true, credentialId: 'c', vct: DIPLOMA, issuerName: 'Tên tự xưng', ...(offer.issuerDid ? { issuerDid: offer.issuerDid } : {}), status: 'valid' }) },
    credentials: {
      list: async () => [
        { id: 'd', vct: DIPLOMA, issuerUri: ISSUER_A, trustPath: 'did', issuerDid: DID, status: 'valid', statusCheckedAt: null, createdAt: '2026-11-19T00:00:00Z' },
        { id: 'x', vct: DIPLOMA, issuerUri: ISSUER_A, trustPath: 'x509', issuerDid: null, status: 'valid', statusCheckedAt: null, createdAt: '2026-11-19T00:00:00Z' },
      ],
      get: async (id) => ({ ok: true, credential: { id, vct: DIPLOMA, issuerUri: ISSUER_A, issuerName: 'Tên tự xưng', ...(id === 'd' ? { trustPath: 'did', issuerDid: DID } : { trustPath: 'x509', issuerDid: null }), status: 'valid', statusCheckedAt: null, createdAt: '', iat: 1, claims: {} } }),
    },
  };

  it('never writes a name for a DID-path receipt or opening, even when the SDK hands one back', async () => {
    const st = storage();
    const named = withIssuerNames(st, sdk);
    await named.accept({ issuerUri: ISSUER_A, issuerDid: DID }, {});
    await named.get('d');
    assert.deepEqual(st.writes, [], 'nothing written for the DID path');
    // The X.509 path is unchanged: its trusted name is remembered.
    await named.get('x');
    assert.deepEqual(JSON.parse(st.map.get(KEY)), { [ISSUER_A]: 'Tên tự xưng' });
    const other = storage();
    await withIssuerNames(other, sdk).accept({ issuerUri: ISSUER_B, issuerDid: null }, {});
    assert.deepEqual(JSON.parse(other.map.get(KEY)), { [ISSUER_B]: 'Tên tự xưng' });
  });

  it('keeps names away from a CertNet-path row by EITHER sign of it (the path, or the identifier alone)', async () => {
    const row = { vct: DIPLOMA, issuerUri: ISSUER_A, status: 'valid', statusCheckedAt: null, createdAt: '2026-11-19T00:00:00Z' };
    const only = (summaries, details, accepted) => ({
      offers: { accept: async () => ({ ok: true, credentialId: 'c', vct: DIPLOMA, issuerName: 'Tên tự xưng', status: 'valid', ...accepted }) },
      credentials: { list: async () => summaries, get: async (id) => ({ ok: true, credential: { id, ...row, issuerName: 'Tên tự xưng', iat: 1, claims: {}, ...details } }) },
    });
    // accept: the offer declared a CertNet identifier, the result does not repeat it (and the other way round).
    for (const [offer, accepted] of [[{ issuerUri: ISSUER_A, issuerDid: DID }, {}], [{ issuerUri: ISSUER_A, issuerDid: null }, { issuerDid: DID }]]) {
      const st = storage();
      await withIssuerNames(st, only([], {}, accepted)).accept(offer, {});
      assert.deepEqual(st.writes, [], JSON.stringify({ offer, accepted }));
    }
    // list and get: only the path, or only the identifier.
    for (const sign of [{ trustPath: 'did', issuerDid: null }, { issuerDid: DID }]) {
      const listed = await withIssuerNames(storage({ [ISSUER_A]: 'Đại học A' }), only([{ id: 'r', ...row, ...sign }], {}, {})).list();
      assert.equal(listed[0].issuerName, null, `list ${JSON.stringify(sign)}`);
      const st = storage();
      await withIssuerNames(st, only([], sign, {})).get('r');
      assert.deepEqual(st.writes, [], `get ${JSON.stringify(sign)}`);
    }
  });

  it('never reads the cached name of its issuer URL for a DID-path document', async () => {
    const byId = Object.fromEntries((await withIssuerNames(storage({ [ISSUER_A]: 'Đại học A' }), sdk).list()).map((c) => [c.id, c.issuerName]));
    assert.deepEqual(byId, { d: null, x: 'Đại học A' });
  });

  it('never takes a name from the known-issuer table for a DID-path document, on any screen\'s view', () => {
    const { knownIssuers, credentialListItem, credentialDetailView, offerView } = require('../.tmp-test/src/native/domain/wallet/walletViews');
    const KNOWN = Object.keys(knownIssuers)[0];
    const row = { id: 'd', vct: DIPLOMA, issuerUri: KNOWN, issuerName: 'Tên lạ', trustPath: 'did', issuerDid: DID, status: 'valid', statusCheckedAt: null, createdAt: '2026-11-19T00:00:00Z' };
    for (const locale of ['vi', 'en']) {
      const views = [credentialListItem(row, locale), credentialListItem({ ...row, trustPath: undefined }, locale), credentialDetailView({ ...row, iat: 1, claims: {} }, locale)];
      for (const v of views) assert.deepEqual([v.trustPath, v.issuerName], ['did', 'a1b2c3d4e5f67890'], locale);
      const offer = offerView({ issuerUri: KNOWN, issuerDid: DID, issuerDisplay: [{ name: 'Tên tự xưng', locale }], configuration: { vct: DIPLOMA }, txCode: null }, locale);
      assert.deepEqual([offer.issuerName, offer.issuerId], [null, 'a1b2c3d4e5f67890']);
      const text = JSON.stringify([views, offer]);
      for (const name of [knownIssuers[KNOWN].name.vi, knownIssuers[KNOWN].name.en, 'Tên lạ', 'Tên tự xưng']) assert.equal(text.includes(name), false, `${locale}: ${name}`);
    }
  });
});

/** The dependencies createPhone used, to build a second wallet on the same phone. */
function phoneDepsOf(phone) {
  return {
    random: createExpoRandomSource((a) => webcrypto.getRandomValues(a)),
    clock: { now: () => new Date('2026-11-19T00:00:00Z') },
    fetch: async () => {
      throw new Error('no network in this test');
    },
    seen: createAsyncStorageSeenStore({ getItem: async () => null, setItem: async () => undefined }),
    keySecrets: createWalletKeySecretStorage(phone.secureStore, { authenticationPrompt: () => 'prompt' }),
    dataKeySecrets: createDataKeySecretStorage(phone.secureStore),
    repository: createSqliteCredentialRepository(async () => phone.db),
    plainStorage: { getItem: async (k) => phone.plain.get(k) ?? null, setItem: async (k, v) => void phone.plain.set(k, v) },
    catalogueFile: { read: async () => phone.catalogueText, write: async (text) => void (phone.catalogueText = text) },
  };
}
