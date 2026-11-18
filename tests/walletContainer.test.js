const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const { createWallet, nextCatalogue, WalletStateError, CATALOGUE_FILE_NAME } = require('../.tmp-test/src/native/domain/wallet/walletContainer');
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
