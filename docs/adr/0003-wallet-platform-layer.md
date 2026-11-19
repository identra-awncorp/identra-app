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
- The backup catalogue is a file in the document directory (`src/native/data/wallet/catalogueFile.ts`).
  expo-file-system's `move(dest, { overwrite: true })` deletes an existing destination before it
  renames, and the moved `File` object then points at `dest` (Android and iOS alike), so a write
  never reuses a `File` object and never moves onto an existing file: write `<name>.next` and read
  it back, move the current file to `<name>.prev`, move `.next` into place, drop `.prev`. `read()`
  falls back to `.prev` while `<name>` is missing; `.next` is never read. Any failed step leaves the
  previous list readable.
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

## Sharing (added 2026-11-19)

- Credentials are shared only after scanning a verifier's `openid4vp://` QR code. The old
  holder-shown "share QR" screens simulated a flow that does not exist in the protocol and were
  removed. The connection-invitation QR in the scanner stays (it is not a credential flow).
- An unverified verifier gets a red warning, decline as the default, and a second explicit
  confirmation before `allowUntrusted: true`; its name and purpose text are never shown.
- The activity log records each presentation with the document id and the claim NAMES only.
- Pending SDK changes are read defensively: offer `issuerOrigin`, accept `status: 'unknown'`.
  `createWallet({ allowedOrigins })` is not set yet (not in the SDK at 0930192).

## Review fixes (added 2026-11-19)

- Receiving: the screen routes an `accept` failure by `retryable` and `codeRedeemed` (SDK field
  being added; read defensively, `undefined` = not redeemed): redeemed and retryable → "Thử lại"
  without the PIN; not redeemed and retryable (no answer to the PIN request, `TX_CODE_REQUIRED`) →
  the PIN step again with the PIN kept; not retryable → a new code. "Đã được dùng" only when
  redeemed or `OFFER_EXPIRED`. With the SDK at 0930192 every retryable failure takes the PIN step
  (the SDK ignores the PIN while it still holds a token), which always completes.
- Sharing route `/present-credential` is behind the same `CredentialAccessGate` and setting as the
  detail screen; the request is resolved (documents decrypted) only after the gate passed. Two
  biometric prompts remain when the gate is on and its 2-minute grace has run out: the gate's own
  (expo-local-authentication) and, at "Chia sẻ", the signing key's (expo-secure-store
  `requireAuthentication`, a per-use keychain/Keystore authorisation that cannot reuse the first:
  expo-secure-store 56 has no validity-duration or shared `LAContext` option). Within the grace the
  gate does not prompt, and a successful signature renews the grace. From "Chia sẻ" until the app
  goes to the background the gate stands aside so that the signing prompt (iOS reports `inactive`
  during it) cannot unmount the screen mid-send; values are re-masked on `inactive`.
- Activity log and backups: sharing records (verifier name, field names, dates, no values) live in
  the app store's identity envelope in SecureStore (service `identra.native.identity`). Android:
  not in any backup (`SecureStore.xml` is excluded by `plugins/withIdentraBackupRules.js`, and its
  key is in the Keystore). iOS: the keychain items use expo-secure-store's default
  `WHEN_UNLOCKED` class, which iOS includes in encrypted (iCloud / encrypted Finder) backups and
  restores to a new phone, so the log can travel with such a backup. A document's records are
  deleted when the document is removed.
- Sharing failures have their own sentence table (`presentationSentenceKeys`, keyed by every code):
  a bad request is about the requester's code, a failed send about delivery; `NETWORK_ERROR` /
  `VERIFIER_ERROR` after "Chia sẻ" are recorded as "có thể đã gửi" (`uncertain`).

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
