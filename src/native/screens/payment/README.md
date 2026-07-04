# Payment Screens

This folder owns the Payment/IDPay product surface.

## Scope

- Payment primary screen and Payment Home composition.
- Card/account detail, card management, CVV reveal sheet, and persisted balance visibility.
- Money transfer flow: recipient, amount, confirmation, result, and receipt.
- Receive money flow: QR receive screen, amount/note setup, and share/copy actions.
- Service payment flows: mobile top-up and bill payment.
- Transaction history and transaction receipt detail.
- Payment suggestions, vertical image banners, and offer detail surfaces.
- Payment search, notifications, placeholder flows, and empty/notice states.

Payment-related sheets launched from Chat still live in `src/native/screens/chat/action-sheets`.

## Important Files

- `PaymentScreen.tsx`: Payment primary screen.
- `components/*`: Payment Home UI pieces such as header, card carousel, quick access, vertical image banner, suggestions, and offers.
- `PaymentInteractionScreens.tsx`: search, notifications, card/account, card management, and generic placeholder flow screens.
- `TransferFlowScreens.tsx`: transfer recipient, amount, confirmation, result, and receipt screens.
- `ReceiveMoneyScreen.tsx`: receive-money QR flow and share/setup sheets.
- `PaymentServiceFlowScreens.tsx`: mobile top-up and bill payment flows.
- `PaymentHistoryScreens.tsx`: transaction history list, filtering, search, and transaction detail.
- `PaymentExploreScreens.tsx`: suggestion and offer detail surfaces.
- `paymentPreferences.ts`: local persisted display preference for Payment Home balance visibility.
- `src/native/data/demo/paymentHomeDemoData.ts`: Payment Home cards/actions/offers.
- `src/native/data/demo/paymentTransferDemoData.ts`: transfer recipients and receipt demo data.
- `src/native/data/demo/paymentServiceDemoData.ts`: mobile top-up and bill payment demo data.
- `src/native/data/demo/paymentHistoryDemoData.ts`: transaction history demo data.
- `src/native/data/demo/paymentExploreDemoData.ts`: suggestions and offer detail demo data.
- `src/native/screens/chat/paymentUtils.ts`: current amount parsing/formatting helpers shared with chat payment flows.
- `src/native/domain/payment`: target location for growing payment domain logic.

## Routes

Route files under `app/` should stay thin and connect to the screen files above.

- `app/payment.tsx`: Payment Home route.
- `app/payment-search.tsx`, `app/payment-notifications.tsx`, `app/payment-flow.tsx`: secondary Payment utility routes.
- `app/payment-account-detail.tsx`, `app/payment-card-manage.tsx`: account/card routes.
- `app/payment-transfer-*.tsx`: transfer flow routes.
- `app/payment-receive.tsx`: receive-money route.
- `app/payment-phone.tsx`, `app/payment-bill.tsx`: service payment routes.
- `app/payment-history.tsx`, `app/payment-transaction-detail.tsx`: transaction history routes.
- `app/payment-explore-detail.tsx`: suggestion/offer detail route.

## Business Rules

- Amounts must be legible and formatted for the selected currency/unit.
- Payment actions must show target, amount, fee/condition where applicable, and final confirmation state.
- Pending, completed, failed, cancelled, and unavailable states must be explicit.
- Transfer, top-up, bill, receive, and offer actions currently use replaceable demo data; UI must continue to tolerate empty or missing API data later.
- Payment Home actions that do not have an implemented demo or production flow must show a clear "coming soon" state instead of implying real availability.
- Payment flows must never log secrets, private keys, PINs, payment credentials, or sensitive identifiers.
- PIN/biometric demo sheets are UI-only until real authentication is integrated; do not treat them as a security boundary.
- Blocking real payment actions must use a loading/locked interaction pattern when API integration is added.
- Android and iOS fallback behavior is required for secure storage, biometric, linking, clipboard, QR, share, and haptic APIs.

## State Boundaries

- Screen-local display state belongs in Payment screen components.
- Route identity belongs in Expo Router params, not mutable global selected state.
- Persisted Payment UI preferences can stay local only while they are display preferences; app-level payment settings should move through the app store.
- Business rules such as amount parsing, validation, transaction status derivation, fee calculation, eligibility checks, and API error mapping belong in `src/native/domain/payment`.
- Transaction validation, transfer/service receipt creation, bill lookup derivation, auth sheet state transitions, and demo-vs-coming-soon availability belong in `src/native/domain/payment`.
- Demo data belongs in `src/native/data/demo` and should remain easy to replace with API responses.

## i18n And Content

- Payment UI labels, buttons, statuses, error copy, empty states, and accessibility labels must use `useI18n`.
- Counterparty names, transaction notes, offer names, provider names, and user-entered memos are data and do not need translation.
- Save text-heavy Payment files as UTF-8 and scan for mojibake after editing Vietnamese copy.

## Tests

When changing payment parsing/formatting behavior, update and run:

- `tests/paymentUtils.test.js`

Add domain tests before moving UI demo behavior into reusable payment logic, especially for:

- transfer validation
- top-up and bill amount/fee calculation
- transaction status derivation
- history filtering/search logic
- offer eligibility and activation state

Also run:

- `npm run lint`
- `npm run typecheck`
