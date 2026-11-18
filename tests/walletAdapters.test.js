const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const { createExpoRandomSource, MAX_RANDOM_BYTES } = require('../.tmp-test/src/native/data/wallet/randomSource');
const {
  createHttpFetch,
  createWalletHttpFetch,
  HttpFetchError,
  CANONICAL_API_ORIGIN,
  MAX_RESPONSE_BYTES,
} = require('../.tmp-test/src/native/data/wallet/httpFetch');
const {
  classifySecureStoreError,
  createDataKeySecretStorage,
  createWalletKeySecretStorage,
  SecretStorageError,
  VAULT_DATA_KEY_SERVICE,
  WALLET_KEYS_INDEX_SERVICE,
  WALLET_KEYS_SERVICE,
} = require('../.tmp-test/src/native/data/wallet/secretStorage');
const { createAsyncStorageSeenStore, SEEN_STORE_PREFIX } = require('../.tmp-test/src/native/data/wallet/seenStore');
const { createSoftwareKeyStore, createCredentialVault, createInMemoryCredentialRepository, CredentialVaultError, WalletKeyError } = require('@identra/sdk-app');
const { createFakeSecureStore, WHEN_UNLOCKED_THIS_DEVICE_ONLY } = require('./helpers/fakeSecureStore');

const nodeRandomValues = (array) => webcrypto.getRandomValues(array);
const random = createExpoRandomSource(nodeRandomValues);

async function rejectsWith(promise, Type, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof Type, `expected ${Type.name}, got ${error?.name}: ${error?.message}`);
    assert.equal(error.code, code);
    return true;
  });
}

describe('RandomSource on expo-crypto', () => {
  it('returns exactly n fresh bytes from getRandomValues', () => {
    const a = random.bytes(32);
    const b = random.bytes(32);
    assert.equal(a.length, 32);
    assert.notDeepEqual(a, b);
  });

  it('refuses out-of-range lengths and a native call that returns the wrong length', () => {
    for (const n of [0, -1, 1.5, MAX_RANDOM_BYTES + 1, Number.NaN]) assert.throws(() => random.bytes(n), RangeError);
    const short = createExpoRandomSource(() => new Uint8Array(4));
    assert.throws(() => short.bytes(16), /wrong length/);
    const notBytes = createExpoRandomSource(() => [1, 2, 3]);
    assert.throws(() => notBytes.bytes(3), /wrong length/);
  });
});

describe('HttpFetch adapter', () => {
  const ok = (body, init) => new Response(body, { status: 200, ...init });

  it('sends https GETs without cookies or redirects, and returns status, headers and text', async () => {
    let seen;
    const fetch = createHttpFetch({
      fetch: async (url, init) => {
        seen = { url, init };
        return ok('eyJ.token', { headers: { 'content-type': 'application/jwt' } });
      },
    });
    const res = await fetch('https://api-identra.awncorp.vn/trust-list', { headers: { accept: 'application/jwt' } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/jwt');
    assert.equal(await res.text(), 'eyJ.token');
    assert.equal(seen.init.redirect, 'manual');
    assert.equal(seen.init.credentials, 'omit');
    assert.equal(seen.init.method, 'GET');
    assert.equal(seen.init.headers.accept, 'application/jwt');
    assert.equal(seen.init.headers['cache-control'], 'no-store');
    assert.ok(seen.init.signal instanceof AbortSignal);
  });

  it('refuses non-https URLs without touching the network', async () => {
    let called = false;
    const fetch = createHttpFetch({ fetch: async () => ((called = true), ok('x')) });
    for (const url of ['http://api-identra.awncorp.vn/x', 'javascript:alert(1)', 'file:///etc/hosts', 'not a url', 'ftp://x.example/']) {
      await rejectsWith(fetch(url), HttpFetchError, 'INSECURE_URL');
    }
    assert.equal(called, false);
  });

  it('times out after timeoutMs, during the request and during the body', async () => {
    const hang = createHttpFetch({
      fetch: (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
        }),
    });
    const started = Date.now();
    await rejectsWith(hang('https://x.example/', { timeoutMs: 30 }), HttpFetchError, 'TIMEOUT');
    assert.ok(Date.now() - started < 2000);

    const slowBody = createHttpFetch({
      fetch: async (_url, init) => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('partial'));
            init.signal.addEventListener('abort', () => controller.error(Object.assign(new Error('aborted'), { name: 'AbortError' })));
          },
        });
        return new Response(stream, { status: 200 });
      },
    });
    await rejectsWith(slowBody('https://x.example/', { timeoutMs: 30 }), HttpFetchError, 'TIMEOUT');
  });

  it('caps the body at 256 KB: declared length, streamed length, and a stream-less response', async () => {
    const big = 'a'.repeat(MAX_RESPONSE_BYTES + 1);
    let cancelled = false;
    const streamed = createHttpFetch({
      fetch: async () =>
        new Response(
          new ReadableStream({
            pull(controller) {
              controller.enqueue(new TextEncoder().encode('a'.repeat(64 * 1024)));
            },
            cancel() {
              cancelled = true;
            },
          }),
          { status: 200 },
        ),
    });
    await rejectsWith(streamed('https://x.example/'), HttpFetchError, 'TOO_LARGE');
    assert.equal(cancelled, true, 'the endless stream is cancelled');

    const declared = createHttpFetch({ fetch: async () => ok('small', { headers: { 'content-length': String(MAX_RESPONSE_BYTES + 1) } }) });
    await rejectsWith(declared('https://x.example/'), HttpFetchError, 'TOO_LARGE');

    const noStream = createHttpFetch({
      fetch: async () => ({ status: 200, headers: new Headers(), body: null, text: async () => big }),
    });
    await rejectsWith(noStream('https://x.example/'), HttpFetchError, 'TOO_LARGE');

    // Multi-byte characters count as bytes, not as string length.
    const multiByte = 'ữ'.repeat(Math.floor(MAX_RESPONSE_BYTES / 3) + 1);
    const utf8 = createHttpFetch({ fetch: async () => ok(multiByte) });
    await rejectsWith(utf8('https://x.example/'), HttpFetchError, 'TOO_LARGE');

    const exact = createHttpFetch({ fetch: async () => ok('a'.repeat(MAX_RESPONSE_BYTES)) });
    assert.equal((await (await exact('https://x.example/')).text()).length, MAX_RESPONSE_BYTES);
  });

  it('returns a 3xx as it is (never followed), refuses a followed redirect, and hides network error details', async () => {
    const manual = createHttpFetch({ fetch: async () => new Response('moved', { status: 302, headers: { location: 'https://evil.example/' } }) });
    const r = await manual('https://x.example/');
    assert.equal(r.status, 302);
    assert.equal(await r.text(), '', 'the body of a redirect is not read');
    const flagged = createHttpFetch({ fetch: async () => ({ status: 200, redirected: true, headers: new Headers(), body: null, text: async () => '' }) });
    await rejectsWith(flagged('https://x.example/'), HttpFetchError, 'REDIRECT');
    const native = createHttpFetch({
      fetch: async () => {
        throw new Error("Redirect is not allowed when redirect mode is 'error'");
      },
    });
    await rejectsWith(native('https://x.example/'), HttpFetchError, 'REDIRECT');

    const secretUrl = 'https://x.example/requests/secret-request-id';
    const failing = createHttpFetch({
      fetch: async () => {
        throw new TypeError(`getaddrinfo failed for ${secretUrl}`);
      },
    });
    await assert.rejects(failing(secretUrl), (error) => {
      assert.equal(error.code, 'NETWORK');
      assert.equal(error.message.includes('secret-request-id'), false);
      return true;
    });
  });

  it('passes method and body through for POST', async () => {
    let seen;
    const fetch = createHttpFetch({ fetch: async (url, init) => ((seen = init), ok('{}')) });
    await fetch('https://x.example/token', { method: 'POST', body: 'a=b', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    assert.equal(seen.method, 'POST');
    assert.equal(seen.body, 'a=b');
  });

  it('maps the canonical origin to EXPO_PUBLIC_IDENTRA_API_URL only in a development build', async () => {
    const urls = [];
    const platformFetch = async (url) => (urls.push(url), ok('x'));

    const dev = createWalletHttpFetch({ fetch: platformFetch, apiUrl: 'http://10.0.2.2:4000/v1', production: false });
    await dev(`${CANONICAL_API_ORIGIN}/trust-list`);
    await dev(`${CANONICAL_API_ORIGIN}/status/7?x=1`);
    await dev('https://other.example/a');
    // http is allowed for the mapped origin only.
    await rejectsWith(dev('http://other.example/a'), HttpFetchError, 'INSECURE_URL');
    // A look-alike host is not the canonical origin.
    await dev(`${CANONICAL_API_ORIGIN}.evil.example/x`);
    assert.deepEqual(urls, [
      'http://10.0.2.2:4000/trust-list',
      'http://10.0.2.2:4000/status/7?x=1',
      'https://other.example/a',
      `${CANONICAL_API_ORIGIN}.evil.example/x`,
    ]);

    urls.length = 0;
    const prod = createWalletHttpFetch({ fetch: platformFetch, apiUrl: 'http://10.0.2.2:4000/v1', production: true });
    await prod(`${CANONICAL_API_ORIGIN}/trust-list`);
    await rejectsWith(prod('http://10.0.2.2:4000/trust-list'), HttpFetchError, 'INSECURE_URL');
    const unset = createWalletHttpFetch({ fetch: platformFetch, apiUrl: '  ', production: false });
    await unset(`${CANONICAL_API_ORIGIN}/trust-list`);
    assert.deepEqual(urls, [`${CANONICAL_API_ORIGIN}/trust-list`, `${CANONICAL_API_ORIGIN}/trust-list`]);
  });
});

describe('SecretStorage adapters on expo-secure-store', () => {
  const prompt = () => 'Xác thực';

  it('stores wallet keys with biometrics, this-device-only, in their own service, plus a presence marker', async () => {
    const store = createFakeSecureStore();
    const secrets = createWalletKeySecretStorage(store, { authenticationPrompt: prompt });
    await secrets.set('identra.key.abc', 'v'.repeat(43));
    const sets = store.state.calls.filter(([op]) => op === 'set');
    assert.deepEqual(sets.map(([, , o]) => o), [
      { keychainService: WALLET_KEYS_INDEX_SERVICE, keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY },
      { keychainService: WALLET_KEYS_SERVICE, requireAuthentication: true, keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY, authenticationPrompt: 'Xác thực' },
    ]);
    assert.equal(await secrets.get('identra.key.abc'), 'v'.repeat(43));
    assert.equal(await secrets.get('identra.key.never-written'), null);
    await secrets.delete('identra.key.abc');
    assert.equal(await secrets.get('identra.key.abc'), null);
    assert.equal(store.state.items.size, 0, 'secret and marker are both gone');
  });

  it('stores the data key WITHOUT biometrics, this-device-only, in another service', async () => {
    const store = createFakeSecureStore();
    const secrets = createDataKeySecretStorage(store);
    await secrets.set('identra.vault.data-key', 'k'.repeat(43));
    const [, , options] = store.state.calls.find(([op]) => op === 'set');
    assert.deepEqual(options, { keychainService: VAULT_DATA_KEY_SERVICE, keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    assert.notEqual(VAULT_DATA_KEY_SERVICE, WALLET_KEYS_SERVICE);
    assert.equal(await secrets.get('identra.vault.data-key'), 'k'.repeat(43));
    assert.equal(await secrets.get('identra.vault.other'), null);
  });

  it('rejects (never resolves null) when the prompt is cancelled or the device is locked', async () => {
    const store = createFakeSecureStore();
    const keys = createWalletKeySecretStorage(store, { authenticationPrompt: prompt });
    const data = createDataKeySecretStorage(store);
    await keys.set('identra.key.k1', 'x'.repeat(43));
    await data.set('identra.vault.data-key', 'y'.repeat(43));

    store.state.cancelNextPrompt = true;
    await rejectsWith(keys.get('identra.key.k1'), SecretStorageError, 'CANCELLED');

    store.state.locked = true;
    await rejectsWith(keys.get('identra.key.k1'), SecretStorageError, 'LOCKED');
    await rejectsWith(data.get('identra.vault.data-key'), SecretStorageError, 'LOCKED');
    await rejectsWith(data.set('identra.vault.data-key', 'z'), SecretStorageError, 'LOCKED');
    store.state.locked = false;
    assert.equal(await data.get('identra.vault.data-key'), 'y'.repeat(43));
  });

  it('reports a key invalidated by a biometric change as KEY_INVALIDATED, not as missing', async () => {
    const store = createFakeSecureStore();
    const secrets = createWalletKeySecretStorage(store, { authenticationPrompt: prompt });
    await secrets.set('identra.key.k1', 'x'.repeat(43));
    store.state.invalidateBiometricKeys();
    // The raw module says null here; the adapter must not.
    assert.equal(await store.getItemAsync('identra.key.k1', { keychainService: WALLET_KEYS_SERVICE, requireAuthentication: true }), null);
    await rejectsWith(secrets.get('identra.key.k1'), SecretStorageError, 'KEY_INVALIDATED');

    // Through the SDK: the wallet key store surfaces the typed error instead of KEY_NOT_FOUND.
    const keyStore = createSoftwareKeyStore({ secrets, random });
    const { keyId } = await keyStore.create();
    store.state.invalidateBiometricKeys();
    // The SDK passes the code on as a WalletKeyError (and the wallet maps it to KEY_INVALIDATED).
    await rejectsWith(keyStore.signer(keyId), WalletKeyError, 'KEY_INVALIDATED');
    // An id that never existed is still the SDK's KEY_NOT_FOUND.
    await rejectsWith(keyStore.signer('AAAAAAAAAAAAAAAAAAAAAA'), WalletKeyError, 'KEY_NOT_FOUND');
  });

  it('maps Android write-time invalidation and other native failures without leaking the message', async () => {
    assert.equal(classifySecureStoreError(new Error("Could not encrypt the value for key 'k' under keychain 'x'. Caused by: The key k has been permanently invalidated and cannot be reinitialized")), 'KEY_INVALIDATED');
    assert.equal(classifySecureStoreError(new Error('User canceled the operation.')), 'CANCELLED');
    assert.equal(classifySecureStoreError(new Error('Could not Authenticate the user: No biometrics are currently enrolled')), 'UNAVAILABLE');
    assert.equal(classifySecureStoreError('weird'), 'UNAVAILABLE');

    const store = createFakeSecureStore();
    const secrets = createWalletKeySecretStorage(store, { authenticationPrompt: prompt });
    store.state.failNextWrite = "An error occurred when writing to key: 'identra.key.k1' under keychain: 'identra.wallet.keys'";
    await assert.rejects(secrets.set('identra.key.k1', 'x'), (error) => {
      assert.equal(error.code, 'UNAVAILABLE');
      assert.equal(error.message.includes('identra.key.k1'), false);
      return true;
    });
  });

  it('removes the marker when the secret write fails, so a failed create never reads as invalidated', async () => {
    const store = createFakeSecureStore();
    const secrets = createWalletKeySecretStorage(store, { authenticationPrompt: prompt });
    store.state.cancelNextPrompt = true; // Android prompts on write too
    await rejectsWith(secrets.set('identra.key.k1', 'x'.repeat(43)), SecretStorageError, 'CANCELLED');
    assert.equal(await secrets.get('identra.key.k1'), null);
  });

  it('refuses oversized values and names the platform would reject; real SDK values are tiny', async () => {
    const store = createFakeSecureStore();
    const secrets = createDataKeySecretStorage(store);
    await rejectsWith(secrets.set('identra.vault.data-key', 'x'.repeat(2049)), SecretStorageError, 'VALUE_TOO_LARGE');
    await rejectsWith(secrets.set('bad name', 'x'), SecretStorageError, 'INVALID_NAME');
    await rejectsWith(secrets.get('bad/name'), SecretStorageError, 'INVALID_NAME');

    // Every value the SDK writes through both storages stays far below SecureStore's 2048 bytes.
    const keyStore = createSoftwareKeyStore({ secrets: createWalletKeySecretStorage(store, { authenticationPrompt: prompt }), random });
    const vault = createCredentialVault({ repository: createInMemoryCredentialRepository(), secrets, random, clock: { now: () => new Date() } });
    const { keyId } = await keyStore.create();
    await vault.save({ compact: 'header.payload.sig~', vct: 'https://identra.awncorp.vn/vct/bang-tot-nghiep/v1', issuer: 'https://issuer.example', keyId });
    const lengths = [...store.state.items.values()].map((i) => i.value.length);
    assert.ok(lengths.length >= 3);
    assert.ok(lengths.every((n) => n <= 44), String(lengths));
  });

  it('lets the vault refuse to recreate a data key that reads as missing while rows exist', async () => {
    const store = createFakeSecureStore();
    const secrets = createDataKeySecretStorage(store);
    const repository = createInMemoryCredentialRepository();
    const vault = createCredentialVault({ repository, secrets, random, clock: { now: () => new Date() } });
    await vault.save({ compact: 'a.b.c~', vct: 'v', issuer: 'i', keyId: 'k' });
    store.state.items.clear();
    await rejectsWith(vault.save({ compact: 'd.e.f~', vct: 'v', issuer: 'i', keyId: 'k' }), CredentialVaultError, 'DATA_KEY_MISSING');
  });
});

describe('SeenStore on AsyncStorage', () => {
  function memoryStorage() {
    const map = new Map();
    return { map, getItem: async (k) => map.get(k) ?? null, setItem: async (k, v) => void map.set(k, v) };
  }

  it('round-trips integer seconds under a dedicated prefix', async () => {
    const storage = memoryStorage();
    const seen = createAsyncStorageSeenStore(storage);
    await seen.set('iat:https://api-identra.awncorp.vn/trust-list', 1763500000);
    assert.equal(await seen.get('iat:https://api-identra.awncorp.vn/trust-list'), 1763500000);
    assert.equal(await seen.get('iat:https://other'), null);
    assert.deepEqual([...storage.map.keys()], [`${SEEN_STORE_PREFIX}iat:https://api-identra.awncorp.vn/trust-list`]);
  });

  it('reads corrupt values as absent and refuses to write non-integers', async () => {
    const storage = memoryStorage();
    const seen = createAsyncStorageSeenStore(storage);
    for (const raw of ['', 'abc', '1.5', '-3', '1e9', '99999999999999999']) {
      storage.map.set(`${SEEN_STORE_PREFIX}k`, raw);
      assert.equal(await seen.get('k'), null, raw);
    }
    for (const bad of [1.5, -1, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
      await assert.rejects(seen.set('k', bad), TypeError);
    }
  });
});
