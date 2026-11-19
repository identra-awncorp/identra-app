# Mobile Quality Gate

## Purpose

Use this runbook before handing off code changes that affect the Identra mobile app.

## When To Use

- Before merging a feature.
- After refactoring route, store, domain, i18n, assets, or feature logic.
- After fixing a regression that should stay fixed.

## Procedure

1. Read the relevant rules:
   - `codex.md`
   - `design.md`
   - feature README if one exists
   - domain README if domain logic is touched
2. Check changed files for unrelated edits.
3. Run static checks:
   - `npm run lint`
   - `npm run typecheck`
4. Run tests:
   - `npm test`
   - `npm run check:bundle` (release gate: no dev-only module or string in the android/ios bundles;
     prints the SDK commit the bundle was built from)
     It cannot catch: dev code that does not live in `src/native/dev/**` or carries no string of 10+
     characters, a dev-only branch guarded only by `__DEV__` inside a normal module, an SDK checkout
     other than the reviewed one (only `RELEASE=1` refuses a dirty SDK tree; the commit must be
     compared by hand), native code, `app.json` / config plugin changes, or anything that only fails
     at run time on a device.
   - The SDK-world proofs (`tests/*.e2e.test.js`) need the SDK built and its test PKI: run
     `sh scripts/pki/ensure-test-pki.sh` in `../identra-sdk` if they report it missing (they skip with
     that message rather than fail).
   - targeted tests for touched logic where practical
5. For UI changes, manually inspect:
   - Android or Android emulator
   - iOS or iOS simulator when available
   - widths around `320`, `390`, and `430` in preview where practical
6. Confirm system UI text uses i18n.
7. Confirm static images are imported through `assetManifest.ts`.
8. Confirm long lists remain virtualized where data can grow.
9. Confirm no fake device chrome was implemented.
10. Confirm sensitive values are not logged.

## Safe Stop

Stop and report clearly if:

- lint/typecheck/test cannot run because dependencies or environment are broken
- mobile simulator/emulator is unavailable
- a change requires a product decision
- a test failure appears unrelated but blocks confidence

## Verification

Record which checks passed and which were skipped in the handoff message.
