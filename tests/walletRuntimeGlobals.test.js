const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const { webcrypto } = require('node:crypto');

const {
  checkWalletRuntime,
  installRandomValues,
  REQUIRED_GLOBAL_FUNCTIONS,
} = require('../.tmp-test/src/native/platform/runtimeGlobals');
const backupPlugin = require('../plugins/withIdentraBackupRules');

/** A global object shaped like Expo 56 on Hermes after installGlobals ran (built from Node's own). */
function healthyGlobals(overrides = {}) {
  const g = {};
  for (const name of REQUIRED_GLOBAL_FUNCTIONS) g[name] = globalThis[name];
  g.crypto = { getRandomValues: (a) => webcrypto.getRandomValues(a) };
  return Object.assign(g, overrides);
}

const kinds = (result) => (result.ok ? [] : result.problems.map((p) => (p.kind === 'missing-global' ? `missing:${p.name}` : p.kind)));

describe('wallet runtime self-check', () => {
  it('passes on a complete runtime', () => {
    assert.deepEqual(checkWalletRuntime(healthyGlobals()), { ok: true });
    assert.deepEqual(checkWalletRuntime(), { ok: true }, 'Node itself has everything');
  });

  it('reports each missing global (bare Hermes lacks TextDecoder, URL, fetch, crypto, ...)', () => {
    const bareHermes = { TextEncoder, atob, btoa, BigInt };
    assert.deepEqual(kinds(checkWalletRuntime(bareHermes)), [
      'missing:TextDecoder',
      'missing:URL',
      'missing:URLSearchParams',
      'missing:Headers',
      'missing:Response',
      'missing:structuredClone',
      'missing:fetch',
      'missing:AbortController',
      'random-unavailable',
    ]);
  });

  it('rejects a constant or repeating random source and one that throws', () => {
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ crypto: { getRandomValues: (a) => a.fill(0) } }))), ['random-constant']);
    let n = 0;
    const counter = (a) => a.fill(n++ % 256);
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ crypto: { getRandomValues: counter } }))), ['random-constant']);
    const fixed = Uint8Array.from({ length: 32 }, (_, i) => i);
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ crypto: { getRandomValues: (a) => (a.set(fixed), a) } }))), ['random-constant']);
    const throwing = () => {
      throw new Error('native module missing');
    };
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ crypto: { getRandomValues: throwing } }))), ['random-unavailable']);
  });

  it('rejects a lossy or non-fatal TextDecoder and a URL without searchParams (React Native\'s own URL)', () => {
    class LossyDecoder {
      decode(bytes) {
        return String.fromCharCode(...bytes);
      }
    }
    class LenientDecoder extends TextDecoder {
      constructor() {
        super('utf-8');
      }
    }
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ TextDecoder: LossyDecoder }))), ['text-codec-broken']);
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ TextDecoder: LenientDecoder }))), ['text-codec-broken']);
    class RnUrl {
      constructor(href) {
        this.href = href;
      }
      get searchParams() {
        throw new Error('URL.searchParams is not implemented');
      }
    }
    assert.deepEqual(kinds(checkWalletRuntime(healthyGlobals({ URL: RnUrl }))), ['url-broken']);
  });

  it('installs crypto.getRandomValues only when absent, never replacing one and never adding subtle', () => {
    const fake = (a) => a;
    const empty = {};
    assert.equal(installRandomValues(empty, fake), true);
    assert.equal(empty.crypto.getRandomValues, fake);
    assert.equal('subtle' in empty.crypto, false);

    const partial = { crypto: {} };
    assert.equal(installRandomValues(partial, fake), true);
    assert.equal(partial.crypto.getRandomValues, fake);

    const native = (a) => a;
    const existing = { crypto: { getRandomValues: native } };
    assert.equal(installRandomValues(existing, fake), false);
    assert.equal(existing.crypto.getRandomValues, native);

    const g = { ...healthyGlobals(), crypto: undefined };
    delete g.crypto;
    installRandomValues(g, (a) => webcrypto.getRandomValues(a));
    assert.deepEqual(checkWalletRuntime(g), { ok: true });
  });
});

describe('Android backup rules (plugins/withIdentraBackupRules.js)', () => {
  it('back up the catalogue and keep the database, AsyncStorage and SecureStore out', () => {
    for (const xml of [backupPlugin.dataExtractionRulesXml, backupPlugin.fullBackupContentXml]) {
      assert.match(xml, /<include domain="file" path="identra-backup-catalogue.json" \/>/);
      assert.match(xml, /<exclude domain="sharedpref" path="SecureStore.xml" \/>/);
      const includes = [...xml.matchAll(/<include domain="([^"]+)" path="([^"]+)"/g)].map((m) => `${m[1]}:${m[2]}`);
      assert.deepEqual(includes, xml === backupPlugin.fullBackupContentXml ? ['file:identra-backup-catalogue.json', 'sharedpref:.'] : [
        'file:identra-backup-catalogue.json',
        'sharedpref:.',
        'file:identra-backup-catalogue.json',
        'sharedpref:.',
      ]);
      assert.equal(/domain="(database|root|external)"[^>]*\/>/.test(xml.replace(/<exclude[^>]*>/g, '')), false);
    }
    assert.match(backupPlugin.dataExtractionRulesXml, /<cloud-backup>[\s\S]*<\/cloud-backup>\s*<device-transfer>[\s\S]*<\/device-transfer>/);
  });
});
