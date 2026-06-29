# Payment Domain

This folder is the target home for payment and IDPay business logic.

Current payment helpers still live near the chat payment flow:

- `src/native/screens/chat/paymentUtils.ts`

Move logic here when it becomes shared across Chat, Payment, News Feed smart contracts, QR, or future mini-apps.

## Domain Responsibilities

- Amount parsing and formatting.
- Currency/unit handling.
- Transfer draft validation.
- Balance checks.
- Payment eligibility.
- Transaction status derivation.
- Fee and deadline calculations.
- Smart-contract payment condition checks.
- Safe user-facing error reason mapping.

## Invariants

- Amount parsing must be deterministic and locale-aware where needed.
- Formatting must not silently change the numeric value.
- Payment actions must never rely only on UI-disabled buttons for safety.
- Transaction state must be explicit: pending, ready, completed, failed, cancelled, unavailable, or sold out.
- Sensitive values such as credentials, keys, PINs, seed phrases, and payment secrets must never be logged.
- Domain logic should not assume a single platform; Android and iOS fallbacks matter at integration boundaries.

## Boundaries

- Domain functions should accept plain data and return plain data.
- Domain functions should not import React, React Native, Expo Router, UI components, theme, or i18n hooks.
- UI is responsible for rendering translated labels and visual states.
- Secure storage, biometrics, and native payment integrations should be wrapped behind services before being consumed by UI.

## Testing

Add or update tests when changing:

- amount parsing/formatting
- transfer validation
- transaction state calculation
- smart-contract payment eligibility
- deadline or availability rules

Relevant current test:

- `tests/paymentUtils.test.js`
