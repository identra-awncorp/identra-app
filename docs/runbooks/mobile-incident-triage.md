# Mobile Incident Triage

## Purpose

Use this runbook for severe app regressions, broken navigation, crashes, authentication loops, payment/credential issues, or release-blocking bugs.

## First Response

1. Identify the affected surface:
   - Chat
   - News Feed
   - Identity
   - Payment
   - QR/Scan
   - Settings
   - App shell/navigation
2. Capture the exact reproduction steps.
3. Capture platform details:
   - Android or iOS
   - device/emulator model
   - Expo Go or development build
   - app version/build if available
4. Check whether the issue affects:
   - all users
   - a specific platform
   - a specific route
   - a specific data state
5. Check recent changes in the affected folder and related domain/store/navigation files.

## Technical Checks

Run targeted checks first:

- `npm run typecheck`
- `npm test`
- relevant targeted test file if known

Then inspect likely boundaries:

- Route mapping in `src/native/app/navigation/navigationLogic.ts`
- Shell behavior in `src/native/app/router/AppShell.tsx`
- Store persistence in `src/native/store`
- Domain logic in `src/native/domain`
- Feature README for expected invariants

## Rollback Or Mitigation

Prefer the lowest-risk mitigation:

- Disable a feature flag if one exists.
- Revert only the offending change when explicitly approved.
- Hide or block the broken entry point if the feature is non-critical.
- Restore a known-safe route mapping or state transition.

Do not run destructive git commands without explicit approval.

## Follow-Up

After the incident:

- Add or update a regression test.
- Update the relevant feature/domain README if the expected behavior was undocumented.
- Add an ADR if the fix changes architecture or long-term product behavior.
