# ADR 0003: Wallet Platform Layer

Status: Accepted
Date: 2026-11-19

## Context

The wallet consumes the Identra SDK (`@identra/sdk-app`, `@identra/sdk-core`) and must give it
randomness, HTTP, secret storage, a credential table and a backup catalogue, following the
parent repository's ADR-0009 (keys, vault, biometrics, backup), ADR-0005 (SDK as `file:`
dependencies) and ADR-0004 (React Native runtime facts).

## Decision

- SDK packages are `file:` dependencies; Metro watches `../identra-sdk` and resolves the SDK's own
  dependencies from there (one copy of each package in the bundle).
- `index.ts` is the entry: it installs `crypto.getRandomValues` from `expo-crypto` (the only
  global Expo 56 lacks; see `src/native/platform/runtimeGlobals.ts`) before Expo Router loads. A
  start-up self-check blocks the app with a translated "device not supported" screen if a global
  is missing or the random source is constant.
- Randomness uses `expo-crypto` `getRandomValues`, not `getRandomBytes`: the latter falls back to
  `Math.random` in development when `global.nativeCallSyncHook` is absent, as in RN 0.85's
  bridgeless runtime.
- Two SecureStore services with different protection (wallet keys with biometrics; vault data
  key without). A non-secret presence marker per wallet key turns SecureStore's ambiguous `null`
  after a biometric change into `KEY_INVALIDATED`.
- Credentials live in `identra-wallet.db` (expo-sqlite), sealed per row by the SDK.
- The backup catalogue is a file in the document directory.
- Android backup: `plugins/withIdentraBackupRules.js` sets `allowBackup`, `fullBackupContent`
  and `dataExtractionRules` to include only the catalogue file and the shared preferences minus
  `SecureStore.xml`. expo-secure-store's own rules are switched off (`configureAndroidBackup: false`).

## iOS backup gap (not solved)

iCloud/Finder backups include the app's `Documents` directory, where expo-sqlite keeps
`Documents/SQLite/identra-wallet.db`. Excluding a file needs `NSURLIsExcludedFromBackupKey`, which
no installed Expo module exposes to JavaScript (`expo-file-system` 56 and `expo-sqlite` 56 have no
such option); the only unbacked locations reachable from JS (`Caches`, `tmp`) can be purged by
iOS, which would lose credentials. So on iOS **the encrypted database is in the backup**.

What limits the damage: every row is AES-256-GCM sealed under a data key stored with
`WHEN_UNLOCKED_THIS_DEVICE_ONLY`, which iOS does not restore to another device, and the wallet
keys are device-only too. On a restored phone the wallet reports `restored-device` (rows present,
data key missing) and deletes the rows only after the user confirms. The backup does reveal how
many credentials the user held, their document type and issuer (the `vct` and `issuer` columns
are in clear, as in the catalogue). Fixing this needs a small native module (or an Expo module
option) that sets `NSURLIsExcludedFromBackupKey` on the database directory.

## Receive and keep (added 2026-11-19)

- The SDK wallet object is built in the container with the pinned DEMO root (`pinnedRoots.ts`),
  `https://api-identra.awncorp.vn/trust-list`, the diploma only, the seen store and the app's
  HttpFetch (`expo/fetch`, `redirect: 'manual'`, per-call `maxBytes`).
- Offers arrive from the scanner only. A deep link `openid-credential-offer://` would need that
  scheme in `app.json` (native change, new build) and an Expo Router `+native-intent` rewrite.
- The list shows the issuer's trusted name remembered at receipt/opening (the SDK list has none).

## Consequences

- `npm install` needs a built `../identra-sdk` checkout.
- The test build compiles to CommonJS with `module: NodeNext` and `require()`s the ESM SDK (Node 24
  supports it); this needs the SDK's `default` export condition (identra-sdk d50b18a or later).
- The JS bundle grows by about 1.3 MB (minified), half of it `zod` pulled in by `@sd-jwt/sd-jwt-vc`.

## Alternatives Considered

- `getRandomBytes`: silent `Math.random` fallback in development builds. Rejected.
- Catalogue in AsyncStorage: on Android it is a SQLite database shared with other app state, so
  backing it up would back up everything in it. Rejected for a dedicated file.
- Database in `Caches` on iOS: not backed up, but purgeable. Rejected.
