# Scan Screens

This folder owns QR scanning and scan-adjacent entry points.

## Scope

- QR scanner primary screen.
- Camera permission request and fallback state.
- Camera preview lifecycle while the Scan tab is active.
- Torch and zoom controls.
- Quick actions for picking an image, opening the user's QR, and viewing scan/activity history.
- Security notice surface for QR safety.

QR sharing and credential sharing screens live under `src/native/screens/identity/share`.

## Important Files

- `QrScannerScreen.tsx`: scanner screen, camera preview, permission fallback, and quick actions.
- `index.ts`: public screen export.
- `src/native/app/router/MainTabKeepAliveScreens.tsx`: passes the active tab state to the scanner.
- `src/native/app/navigation/sideMenuSettingsConfig.ts`: Scan settings exposed through the side menu.
- `src/native/i18n/locales/vi.ts` and `src/native/i18n/locales/en.ts`: Scan UI copy and accessibility labels.

## Business Rules

- Camera access must only be requested when the screen is active and permission can still be requested.
- Camera preview should not stay active when another keep-alive tab is visible.
- Permission fallback must provide a clear action to request camera access.
- Torch, zoom, and scanner controls must remain usable on Android and iOS.
- Placeholder actions such as picking an image must show a clear pending state until implemented.
- QR safety copy must not imply a scanned QR is trusted without validation.

## State Boundaries

- Torch, zoom, and permission-request guard state are local to `QrScannerScreen`.
- Active/inactive lifecycle comes from the app router keep-alive layer.
- Scan settings live under `flowSettings.scan` in app settings.
- Reusable QR parsing, risk classification, verified-link checks, or scan-history derivation should move into a future scan domain service.

## i18n And Content

- Screen titles, button labels, pending copy, permission copy, and accessibility labels must use `useI18n`.
- Scanned QR payloads are data and should not be translated.

## Tests

When changing Scan route, tab, settings, or active keep-alive behavior, update and run:

- `tests/navigationLogic.test.js`

Also run:

- `npm run lint`
- `npm run typecheck`
