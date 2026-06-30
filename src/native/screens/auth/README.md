# Auth Screens

This folder owns onboarding, login, registration, and phone OTP verification surfaces.

## Scope

- Onboarding entry screen.
- Login by phone number.
- Registration by phone number.
- Registration confirmation modal.
- OTP entry, resend, expiry, and verification loading states.

Authenticated app routing and redirects live in `src/native/app/router`.

## Important Files

- `OnboardingScreen.tsx`: unauthenticated landing screen and entry actions.
- `LoginScreen.tsx`: login wrapper around the shared phone auth form.
- `RegisterScreen.tsx`: registration flow, phone confirmation modal, and OTP step switch.
- `PhoneAuthScreen.tsx`: shared phone number form for login and registration.
- `OtpVerificationScreen.tsx`: 6-digit OTP input, countdown, resend, and verify behavior.
- `src/native/app/router/AppShell.tsx`: auth route guarding and post-auth redirects.
- `src/native/app/router/AppRouterContext.tsx`: `authCompleted` state and router UI context.

## Business Rules

- Unauthenticated users should stay on onboarding, login, register, or OTP-related flow surfaces.
- Successful login or registration must complete auth through the app router context before showing authenticated tabs.
- Phone numbers are normalized to Vietnam `+84` format before leaving the auth form.
- Registration requires both usage and social terms before requesting verification.
- OTP codes must be numeric, 6 digits long, and time-bound.
- OTP entry must remain easy to focus on Android and iOS; custom OTP boxes should not block the native `TextInput` from opening the keyboard.
- Blocking auth actions should use `LoadingOverlay` or a disabled/locked interaction pattern.

## State Boundaries

- Auth navigation state such as phone step vs OTP step can stay inside `RegisterScreen`.
- Shared auth completion state belongs in `AppRouterContext`.
- Persisted app data hydration and authenticated route redirects belong in `AppShell`.
- Reusable validation or auth service behavior should move into a future `src/native/domain/auth` module when it becomes testable outside UI.

## i18n And Content

- Titles, descriptions, buttons, alerts, legal copy, and accessibility labels must use `useI18n`.
- Phone numbers and user-entered OTP values are user data and should not be translated.
- Legal and consent copy should stay consistent across Vietnamese and English locale files.

## Tests

When changing auth redirects or route visibility, update and run:

- `tests/navigationLogic.test.js`

When changing translation keys or auth copy, also run:

- `tests/i18n.test.js`

Also run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
