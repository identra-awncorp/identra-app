# Payment Domain

This folder is the target home for payment and IDPay business logic.

Current Payment UI flows are implemented under `src/native/screens/payment` and use replaceable demo data from `src/native/data/demo`. Shared amount helpers still live near the chat payment flow:

- `src/native/screens/chat/paymentUtils.ts`
- `src/native/domain/payment/paymentRequest.ts`: shared request-state helpers for loading, timeout, API failure, insufficient balance, and duplicate-submit guards.
- `src/native/domain/payment/paymentAuth.ts`: shared transaction authentication sheet state transitions.
- `src/native/domain/payment/paymentTransfer.ts`: transfer validation and receipt creation.
- `src/native/domain/payment/paymentServices.ts`: phone top-up validation, bill lookup validation, bill preview creation, and service receipt creation.
- `src/native/domain/payment/paymentAvailability.ts`: demo vs coming-soon capability boundaries for Payment entry points.

Move logic here when it becomes shared across Chat, Payment, News Feed smart contracts, QR, service payments, transaction history, offers, or future mini-apps.

## Domain Responsibilities

- Amount parsing and formatting.
- Currency/unit handling.
- Transfer draft validation.
- Mobile top-up validation.
- Bill lookup/payment validation.
- Balance checks.
- Payment eligibility.
- Transaction status derivation.
- Fee and deadline calculations.
- Transaction history filtering/search derivation when it becomes shared or API-backed.
- Offer eligibility, activation state, and benefit calculation.
- Smart-contract payment condition checks.
- Safe user-facing error reason mapping.
- Request timeout and failure-state mapping before UI rendering.

## Invariants

- Amount parsing must be deterministic and locale-aware where needed.
- Formatting must not silently change the numeric value.
- Payment actions must never rely only on UI-disabled buttons for safety.
- Transaction state must be explicit: pending, ready, completed, failed, cancelled, unavailable, or sold out.
- Demo UI confirmation/PIN sheets are not a security boundary; real authorization must be enforced by domain/API integration.
- Fees, discounts, offer eligibility, and provider availability must be calculated from trusted API/domain data before money movement.
- Sensitive values such as credentials, keys, PINs, seed phrases, and payment secrets must never be logged.
- Domain logic should not assume a single platform; Android and iOS fallbacks matter at integration boundaries.

## Boundaries

- Domain functions should accept plain data and return plain data.
- Domain functions should not import React, React Native, Expo Router, UI components, theme, or i18n hooks.
- UI is responsible for rendering translated labels and visual states.
- Route params and screen-local UI state should not become implicit domain state.
- Demo data modules should provide replaceable records only; validation, receipt creation, bill lookup derivation, auth state transitions, and capability availability belong here.
- Secure storage, biometrics, and native payment integrations should be wrapped behind services before being consumed by UI.

## Testing

Add or update tests when changing:

- amount parsing/formatting
- transfer validation
- top-up validation
- bill amount/fee calculation
- transaction state calculation
- transaction history filtering/search logic
- offer eligibility/activation calculation
- smart-contract payment eligibility
- deadline or availability rules

Relevant current test:

- `tests/paymentUtils.test.js`
