# Auth Domain

This folder owns authentication API integration and persisted auth session storage.

## Domain Responsibilities

- Device identity creation and persistence.
- Registration start, registration verification, and registration password setup.
- Password login start and OTP step-up verification.
- Token refresh and logout.
- Auth success persistence.
- Auth error normalization for UI surfaces.
- Secure storage with AsyncStorage fallback when SecureStore is unavailable.
- Development and production API base URL resolution.

## Important Files

- `authClient.ts`: Identra Server auth API client, device metadata, token persistence helpers, request timeout/error handling, and sensitive log redaction.
- `authSessionStorage.ts`: SecureStore-backed auth session and device ID storage with AsyncStorage fallback and legacy-key import.
- `index.ts`: public domain exports.
- `src/native/screens/auth/README.md`: screen-level auth flow rules.
- `src/native/app/router/AppRouterContext.tsx`: auth session hydration, refresh, completion, and logout orchestration.

## Invariants

- Production builds must use a configured non-loopback API URL.
- Auth requests must timeout and return user-safe error messages.
- Passwords, tokens, and authorization values must be redacted from development logs.
- Stored auth sessions must include access token, refresh token, expiry timestamps, session ID, user ID, and device ID.
- SecureStore should be preferred when available; AsyncStorage is only a fallback.
- Logout must clear local auth session state even if the server revoke request fails.
- Device ID should remain stable across app launches once generated.

## Boundaries

- This folder should not import React components, app screens, route files, theme, or i18n hooks.
- UI screens decide how to present errors, loading states, and OTP/password forms.
- Router context owns authenticated app entry, redirects, hydration, refresh timing, and logout UI flow.
- Auth validation helpers used only by auth UI can stay in `src/native/screens/auth/authLogic.ts` until they become shared domain behavior.

## Testing

When changing API client behavior, add targeted tests before the logic becomes more complex.

When changing OTP/password validation helpers, update and run:

- `tests/authLogic.test.js`

When changing auth route behavior, update and run:

- `tests/navigationLogic.test.js`
