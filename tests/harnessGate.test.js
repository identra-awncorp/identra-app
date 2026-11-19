// The scripted review wallet must not be reachable from a normal build (review H1).
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const root = path.resolve(__dirname, '..');
function resolveWith(env) {
  const script = `
    const c = require('./metro.config.js');
    const r = c.resolver.resolveRequest({ resolveRequest: () => ({ type: 'other' }) }, 'identra-wallet-harness', 'android');
    const other = c.resolver.resolveRequest({ resolveRequest: () => ({ type: 'upstream' }) }, 'react', 'android');
    console.log(JSON.stringify({ file: r.filePath, other: other.type, cacheVersion: c.cacheVersion, stores: (c.cacheStores || []).map((s) => s.root || s._root || null) }));`;
  const run = spawnSync(process.execPath, ['-e', script], { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout.trim().split('\n').pop());
}

describe('wallet harness gate', () => {
  it('resolves to the empty module in a normal build and keeps a separate cache key', () => {
    const off = resolveWith({ EXPO_PUBLIC_WALLET_HARNESS: '' });
    assert.equal(path.relative(root, off.file), path.join('src', 'native', 'platform', 'harnessDisabled.ts'));
    assert.match(off.cacheVersion, /wallet-harness-off$/);
    assert.notEqual(off.other, 'other', 'other modules go to the normal resolver');
  });

  it('resolves to the harness only with EXPO_PUBLIC_WALLET_HARNESS=1, with its own cache', () => {
    const on = resolveWith({ EXPO_PUBLIC_WALLET_HARNESS: '1' });
    assert.equal(path.relative(root, on.file), path.join('src', 'native', 'dev', 'walletHarness.ts'));
    assert.match(on.cacheVersion, /wallet-harness-on$/);
    assert.equal(on.stores.length, 1);
  });

  it('is refused outside __DEV__ at runtime, and the empty module carries no harness', () => {
    const runtime = fs.readFileSync(path.join(root, 'src/native/domain/wallet/walletRuntime.ts'), 'utf8');
    assert.match(runtime, /if \(__DEV__ && harness\) return harness\.wallet\(\);/);
    assert.equal(/walletHarness|localStorage|identra\.harness/.test(runtime.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '')), false, 'no harness code in the runtime module');
    const stub = fs.readFileSync(path.join(root, 'src/native/platform/harnessDisabled.ts'), 'utf8');
    assert.match(stub, /export const harness: WalletHarness \| null = null;/);
  });
});
