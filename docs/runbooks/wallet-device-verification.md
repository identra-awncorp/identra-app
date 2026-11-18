# Wallet Device Verification

## Purpose

The wallet platform layer is proven in Node (adapters against faithful fakes, SQL run by
`node:sqlite`), by `npx expo export` for Android and iOS, and by running the SDK on a Hermes VM.
None of that touches a real Keychain, Keystore, SQLite file, biometric prompt or OS backup. Run
this checklist on physical devices before relying on the wallet.

## Preconditions

- Development build (`npx expo run:android` / `run:ios`, or EAS), not Expo Go.
- One Android phone (API 31+, and one API ≤ 30 if available) and one iPhone, each with biometrics enrolled.
- A test hook or debug screen that calls `getWallet(...)` (the issuance screens come later).

## Procedure

1. Start-up: the app opens normally (no "device not supported" screen). With the debugger, `checkWalletRuntime()` returns `{ ok: true }`.
2. Randomness: two `wallet.random.bytes(32)` calls differ, in a development AND a release build.
3. Wallet key: `keyStore.create()` prompts for biometrics on Android (not on iOS); `keyStore.signer(id)` prompts on both.
4. Cancel the prompt: the call rejects with `SecretStorageError` code `CANCELLED`, never `KEY_NOT_FOUND`.
5. Biometric change: add a fingerprint / reset Face ID, then `signer(id)` → `KEY_INVALIDATED`; reading the data key and opening the vault still work.
6. Locked device (iOS): from a background task while locked, a data-key read rejects with `LOCKED`.
7. Vault: save, list, open, setStatus, removeWithKey; kill and restart the app; rows and catalogue survive.
8. Files: the database is at `files/SQLite/identra-wallet.db` (Android) / `Documents/SQLite/identra-wallet.db` (iOS); the catalogue at `files/identra-backup-catalogue.json` / `Documents/identra-backup-catalogue.json` and contains only `vct` and `issuer`.
9. Android backup: `adb shell bmgr backupnow com.identra.app`, uninstall, reinstall with restore (or `adb shell bmgr restore`). Expect: catalogue back; database, SecureStore prefs absent; `getStartupState()` → `ready` with `toRequest` listing the documents.
10. iOS backup: back up, restore to a second iPhone. Expect (known gap): database back, data key not; `getStartupState()` → `restored-device`; after `acknowledgeNewDevice()` the vault is empty and the catalogue lists the documents.
11. HTTP: against a test server, a redirect is refused (`REDIRECT`), a >256 KB body is refused (`TOO_LARGE`), a stalled response times out (`TIMEOUT`), no cookie is sent or stored, and a development build with `EXPO_PUBLIC_IDENTRA_API_URL` reaches the mapped origin.
12. QR: scanning `openid-credential-offer://?credential_offer_uri=https://…` and `openid4vp://?client_id=…&request_uri=https://…` shows the translated "cannot open yet" message in both languages; nothing is fetched (check server logs).
13. Android build: `./gradlew :app:lintRelease` shows no `FullBackupContent` errors and the merged manifest keeps `@xml/identra_backup_rules` / `@xml/identra_data_extraction_rules`.

## Safe Stop

Stop and report if any step returns `null` where a rejection is expected, or if the database or
SecureStore prefs appear in an Android restore.

## Verification

Record the device models, OS versions and the result of each step in the hand-off.
