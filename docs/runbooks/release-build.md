# Release Build

## Purpose

Build a release that contains exactly the reviewed SDK and no dev-only code.

## Why

The SDK is a `file:` dependency (ADR-0005). Its packages and THEIR dependencies are bundled from
`../identra-sdk` and `../identra-sdk/node_modules`, which this app's `package-lock.json` does not pin.

## Procedure

1. Check out the SDK at the reviewed commit, clean: `git -C ../identra-sdk status` shows nothing.
2. In `../identra-sdk`: `npm ci --ignore-scripts`, then `npm run build`.
3. In this app: `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`.
4. `RELEASE=1 npm run check:bundle` with `EXPO_PUBLIC_WALLET_HARNESS` unset. It prints `SDK: <commit>`;
   that commit goes into the release notes. It refuses to pass if the SDK working tree is modified or any
   `src/native/dev/**` module or string is in the bundle.
5. Build (EAS or local) from the same checkouts without further changes.

## Safe Stop

Stop if `check:bundle` fails, prints a modified SDK tree, or a commit other than the reviewed one.
