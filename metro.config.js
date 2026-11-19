// Expo's default Metro config plus the local Identra SDK (ADR-0005: `file:` dependencies).
// node_modules/@identra/sdk-{app,core} are symlinks into ../identra-sdk/packages. Metro follows
// them to their real path, so the SDK's own dependencies (@noble/*, @sd-jwt/*, zod, ...) resolve
// hierarchically from ../identra-sdk/node_modules, and everything the app imports (React, React
// Native, Expo) from this app's node_modules. Nothing is resolved from both places: the SDK has
// no React/Expo dependency, and the app imports no SDK dependency directly.
const os = require('os');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '../identra-sdk');

const config = getDefaultConfig(projectRoot);

// Metro only reads files inside watched folders; the SDK lives outside the project.
config.watchFolders = [...(config.watchFolders ?? []), sdkRoot];
// The SDK packages publish ESM through `exports` maps only (default in Metro 0.82+, explicit here).
config.resolver.unstable_enablePackageExports = true;
// expo-sqlite's web build imports its wasm engine (Expo's documented setting); native ignores it.
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

// The scripted review wallet (src/native/dev/walletHarness.ts) exists in the module graph ONLY
// when EXPO_PUBLIC_WALLET_HARNESS=1; every other build resolves `identra-wallet-harness` to an
// empty module. The variable is part of the cache key, and harness builds use their own cache
// directory, so a harness build can never leave transformed modules behind for a release build.
const harnessOn = process.env.EXPO_PUBLIC_WALLET_HARNESS === '1';
const harnessModule = path.resolve(projectRoot, harnessOn ? 'src/native/dev/walletHarness.ts' : 'src/native/platform/harnessDisabled.ts');
config.cacheVersion = `${config.cacheVersion ?? '1.0'}+wallet-harness-${harnessOn ? 'on' : 'off'}`;
if (harnessOn) config.cacheStores = [new FileStore({ root: path.join(os.tmpdir(), 'metro-cache-identra-harness') })];
const upstreamResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'identra-wallet-harness') return { type: 'sourceFile', filePath: harnessModule };
  return upstreamResolve ? upstreamResolve(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
