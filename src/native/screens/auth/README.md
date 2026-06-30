# Auth Screens

This folder owns onboarding, password login, registration, phone OTP verification, and password creation surfaces.

## Scope

- Onboarding entry screen.
- Login by phone number and password.
- Registration by phone number.
- Registration confirmation modal.
- OTP entry, resend, expiry, and verification loading states.
- Password creation after successful registration OTP verification.

Authenticated app routing and redirects live in `src/native/app/router`.

## Important Files

- `OnboardingScreen.tsx`: unauthenticated landing screen and entry actions.
- `LoginScreen.tsx`: login wrapper around the shared phone auth form.
- `RegisterScreen.tsx`: registration flow, phone confirmation modal, and OTP step switch.
- `PhoneAuthScreen.tsx`: shared phone number form for login and registration.
- `OtpVerificationScreen.tsx`: 6-digit OTP input, countdown, resend, and verify behavior.
- `CreatePasswordScreen.tsx`: post-OTP password creation and password requirement checklist.
- `AuthNoticeModal.tsx`: in-app notice modal for auth validation and informational messages.
- `authLogic.ts`: pure OTP sanitation and demo verification result logic.
- `src/native/app/router/AppShell.tsx`: auth route guarding and post-auth redirects.
- `src/native/app/router/AppRouterContext.tsx`: `authCompleted` state and router UI context.

## Business Rules

- Unauthenticated users should stay on onboarding, login, register, or OTP-related flow surfaces.
- Successful login completes auth through the app router context before showing authenticated tabs.
- Successful registration OTP verification moves to password creation; only a valid password can return the user to login.
- Phone numbers are normalized to Vietnam `+84` format before leaving the auth form.
- Registration requires both usage and social terms before requesting verification.
- OTP codes must be numeric, 6 digits long, and time-bound.
- OTP resend must be disabled for 60 seconds and show the remaining countdown before becoming available.
- Until a backend OTP service exists, prototype verification accepts only the fixed demo code `123456`.
- Password creation requires at least 8 characters, uppercase, lowercase, number, special character, and matching confirmation.
- Login requires phone number and password; it should not show SMS/OTP delivery copy.
- OTP entry must remain easy to focus on Android and iOS; custom OTP boxes should not block the native `TextInput` from opening the keyboard.
- Blocking auth actions should use `LoadingOverlay` or a disabled/locked interaction pattern.
- Auth validation and informational notices should use `AuthNoticeModal` instead of native system alerts.

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

When changing OTP or password validation behavior, update and run:

- `tests/authLogic.test.js`

When changing translation keys or auth copy, also run:

- `tests/i18n.test.js`

Also run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
