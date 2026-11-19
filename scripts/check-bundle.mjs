// Release gate: a clean (--clear) export for android and ios must contain no module of
// src/native/dev/** (the scripted review wallet) and none of its strings. Prints the SDK commit the
// bundle was built against (release builds come from a pinned SDK, docs/runbooks/release-build.md).
//   npm run check:bundle
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.env.EXPO_PUBLIC_WALLET_HARNESS) {
  console.error('check:bundle refuses to run with EXPO_PUBLIC_WALLET_HARNESS set.');
  process.exit(2);
}

const sdk = path.resolve(root, '../identra-sdk');
const git = (...args) => execFileSync('git', ['-C', sdk, ...args], { encoding: 'utf8' }).trim();
const sdkCommit = git('rev-parse', 'HEAD');
const sdkDirty = git('status', '--porcelain', '--untracked-files=no') !== '';
console.log(`SDK: ${sdkCommit}${sdkDirty ? ' (WORKING TREE MODIFIED: not a releasable build)' : ''}`);
if (sdkDirty && process.env.RELEASE === '1') {
  console.error('RELEASE=1: the SDK working tree must be clean.');
  process.exit(1);
}

// Every string literal of 10+ characters in the dev-only modules that appears nowhere else (app
// sources, SDK builds): those can only reach a bundle through a dev module.
const devDir = path.join(root, 'src/native/dev');
const walk = (dir, keep) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || p === devDir ? [] : walk(p, keep);
    return keep(e.name) ? [p] : [];
  });
const elsewhere = [
  ...walk(path.join(root, 'src'), (n) => /\.tsx?$/.test(n)),
  ...walk(path.join(root, 'app'), (n) => /\.tsx?$/.test(n)),
  ...readdirSync(path.join(sdk, 'packages')).flatMap((p) => (existsSync(path.join(sdk, 'packages', p, 'dist')) ? walk(path.join(sdk, 'packages', p, 'dist'), (n) => n.endsWith('.js')) : [])),
].map((f) => readFileSync(f, 'utf8')).join('\n');
const forbidden = new Set(['getHarnessWallet']);
for (const file of readdirSync(devDir).filter((f) => /\.tsx?$/.test(f))) {
  for (const m of readFileSync(path.join(devDir, file), 'utf8').matchAll(/(['"`])((?:(?!\1)[^\\\n]){10,})\1/g)) {
    if (!m[2].includes('${') && !elsewhere.includes(m[2])) forbidden.add(m[2]);
  }
}

let failed = false;
for (const platform of ['android', 'ios']) {
  const out = `/tmp/identra-app-check-bundle-${platform}`;
  rmSync(out, { recursive: true, force: true });
  execFileSync('npx', ['expo', 'export', '--platform', platform, '--clear', '--no-bytecode', '--source-maps', '--output-dir', out], {
    cwd: root, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, CI: '1' },
  });
  const dir = path.join(out, '_expo/static/js', platform);
  const js = readdirSync(dir).find((f) => f.endsWith('.js'));
  const bundle = readFileSync(path.join(dir, js), 'utf8');
  const sources = JSON.parse(readFileSync(path.join(dir, `${js}.map`), 'utf8')).sources;
  const devModules = sources.filter((s) => s.includes('/src/native/dev/'));
  const leaked = [...forbidden].filter((s) => bundle.includes(s));
  console.log(`${platform}: ${bundle.length} bytes, ${sources.length} modules, dev modules: ${devModules.length}, dev strings: ${leaked.length}`);
  if (devModules.length || leaked.length) {
    failed = true;
    for (const s of devModules) console.error(`  module: ${s}`);
    for (const s of leaked.slice(0, 10)) console.error(`  string: ${s}`);
  }
}
if (!existsSync(devDir) || forbidden.size < 5) {
  console.error('check:bundle found too few dev strings to check: the scan itself is broken.');
  failed = true;
}
console.log(failed ? 'check:bundle FAILED' : `check:bundle ok (${forbidden.size} dev strings checked)`);
process.exit(failed ? 1 : 0);
