# Wallet Domain

The platform layer under the verifiable-credential wallet (decision records ADR-0009, ADR-0005,
ADR-0014 §2 in the parent repository; app-side decisions in `docs/adr/0003-wallet-platform-layer.md`).
Protocol and cryptography live in `@identra/sdk-app` / `@identra/sdk-core`; this folder only wires them.

## Files

- `walletContainer.ts`: pure `createWallet(deps)`: key store, vault (catalogue-syncing), start-up state, restore list. Tested in Node.
- `walletRuntime.ts`: the memoised instance on the real Expo modules (`getWallet`) and `handOffWalletRequest`, the single entry from the QR scanner.
- `credentialPresentation.ts`: `vct` → document name, diploma claim labels and order, date format, vault status → app status. Returns i18n keys.
- Adapters: `src/native/data/wallet/*` (random, HTTP, SecureStore, SQLite, AsyncStorage seen-store).
- Runtime globals and self-check: `src/native/platform/*`, imported first by `index.ts`.

## Invariants

- One wallet per app process; created on first use, never at import.
- Wallet keys: SecureStore, biometrics on every read, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, service `identra.wallet.keys`. The vault data key: no biometrics, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, service `identra.wallet.vault`.
- `SecretStorage.get` resolves `null` only for "not found". Cancelled prompt, locked device, invalidated key and any other failure reject with `SecretStorageError` (codes `CANCELLED`, `LOCKED`, `KEY_INVALIDATED`, `UNAVAILABLE`). `KEY_INVALIDATED` = biometrics changed: that credential must be requested again.
- SQLite file `identra-wallet.db`, table from the SDK's `CREDENTIALS_TABLE_DDL`, version in `PRAGMA user_version`, bound parameters only, one statement at a time.
- The backup catalogue file `identra-backup-catalogue.json` lists document type and issuer only. It keeps documents that a restored phone still has to request again: a save adds, a removal drops only what no row holds, `forgetDocument` drops on request.
- Rows without the data key (`restored-device`) are never deleted until the user confirms (`acknowledgeNewDevice`).
- Errors carry codes only: no key, data key, compact credential, claim value, URL or native message.
- HTTP: https only (plus the mapped development origin), no redirects, no cookies, 10 s default timeout, 256 KB body cap.

## Tests

`tests/walletAdapters.test.js`, `tests/walletRepository.test.js` (SQL run by `node:sqlite`),
`tests/walletContainer.test.js`, `tests/walletRuntimeGlobals.test.js`, `tests/qrScan.test.js`.
What only a device can prove: `docs/runbooks/wallet-device-verification.md`.
