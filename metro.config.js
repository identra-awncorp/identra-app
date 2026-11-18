// Expo's default Metro config plus the local Identra SDK (ADR-0005: `file:` dependencies).
// node_modules/@identra/sdk-{app,core} are symlinks into ../identra-sdk/packages. Metro follows
// them to their real path, so the SDK's own dependencies (@noble/*, @sd-jwt/*, zod, ...) resolve
// hierarchically from ../identra-sdk/node_modules, and everything the app imports (React, React
// Native, Expo) from this app's node_modules. Nothing is resolved from both places: the SDK has
// no React/Expo dependency, and the app imports no SDK dependency directly.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '../identra-sdk');

const config = getDefaultConfig(projectRoot);

// Metro only reads files inside watched folders; the SDK lives outside the project.
config.watchFolders = [...(config.watchFolders ?? []), sdkRoot];
// The SDK packages publish ESM through `exports` maps only (default in Metro 0.82+, explicit here).
config.resolver.unstable_enablePackageExports = true;

// expo-sqlite's web build imports its wasm engine (Expo's documented setting); native ignores it.
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
