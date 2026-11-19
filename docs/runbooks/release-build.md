# Release Build

## Purpose

Build a release that contains exactly the reviewed SDK and no dev-only code.

## Why

The SDK is a `file:` dependency (ADR-0005). Its packages and THEIR dependencies are bundled from
`../identra-sdk` and `../identra-sdk/node_modules`, which this app's `package-lock.json` does not pin.

## Procedure

1. Check out the SDK at the reviewed commit, clean: `git -C ../identra-sdk status` shows nothing.
2. In `../identra-sdk`: `npm ci --ignore-scripts`, then `npm run build`, then
   `sh scripts/pki/ensure-test-pki.sh` (the test PKI the app's SDK-world tests sign with; without it
   those tests are skipped, and a release must not be cut on skipped proofs).
3. In this app: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`.
4. `RELEASE=1 npm run check:bundle` with `EXPO_PUBLIC_WALLET_HARNESS` unset. It prints `SDK: <commit>`;
   that commit goes into the release notes. It refuses to pass if the SDK working tree is modified or any
   `src/native/dev/**` module or string is in the bundle. It does not prove anything else (see
   `mobile-quality-gate.md`): `npm test` must show 0 skipped.
5. Build (EAS or local) from the same checkouts without further changes.

## Safe Stop

Stop if `check:bundle` fails, prints a modified SDK tree, or a commit other than the reviewed one.
