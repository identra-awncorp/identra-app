# Payment Screens

This folder owns the Payment/IDPay product surface.

## Scope

- Payment tab entry screen.
- Future IDPay balance, transaction, payment request, and transfer surfaces.
- Future payment-specific settings and empty states.

Payment-related sheets currently launched from chat live in `src/native/screens/chat/action-sheets`.

## Important Files

- `PaymentScreen.tsx`: Payment tab landing screen.
- `src/native/screens/chat/paymentUtils.ts`: current payment amount helpers used by chat payment flows.
- `src/native/domain/payment`: target location for growing payment domain logic.

## Business Rules

- Amounts must be legible and formatted for the selected currency/unit.
- Payment actions must show target, amount, fee/condition where applicable, and final confirmation state.
- Pending, completed, failed, cancelled, and unavailable states must be explicit.
- Payment flows must never log secrets, private keys, PINs, payment credentials, or sensitive identifiers.
- Blocking payment actions must use a loading/locked interaction pattern.
- Android and iOS fallback behavior is required for secure storage, biometric, linking, clipboard, QR, and haptic APIs.

## State Boundaries

- Screen-local display state belongs in the payment screen.
- Business rules such as amount parsing, validation, transaction status derivation, fee calculation, and eligibility checks belong in `src/native/domain/payment`.
- Persisted payment settings should go through the app store only when they are truly app-level state.

## i18n And Content

- Payment UI labels, buttons, statuses, error copy, empty states, and accessibility labels must use `useI18n`.
- Counterparty names, transaction notes, and user-entered memos are data and do not need translation.

## Tests

When changing payment parsing/formatting behavior, update and run:

- `tests/paymentUtils.test.js`

Add domain tests for new payment business rules before wiring those rules into UI.
