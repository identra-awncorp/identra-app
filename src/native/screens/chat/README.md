# Chat Conversation Screens

This folder owns the open conversation experience and chat-adjacent action sheets.

## Scope

- Direct or group conversation UI.
- Message timeline and composer behavior.
- Attachment/action menu.
- Payment request and QR payment sheets.
- Direct transfer sheets.
- Reminder sheet.
- Smart-contract setup sheet launched from chat.

The conversation list and preview logic live in `src/native/screens/chat-list`.

## Important Files

- `ChatScreen.tsx`: route-level conversation screen.
- `ChatConversation.tsx`: main conversation surface.
- `ChatActionMenu.tsx`: quick action menu.
- `ChatActionSheet.tsx`: shared action sheet container.
- `action-sheets/*`: focused sheet implementations.
- `paymentUtils.ts`: current pure payment formatting/parsing helpers.
- `src/native/data/demo/chatFlowDemoData.ts`: replaceable demo conversation data.

## Business Rules

- Chat UI must preserve user-entered text when temporary sheets are opened or closed.
- Payment and transfer flows must show clear amount, unit, target, and confirmation state.
- Smart-contract creation from chat must keep trade item, counter item, deadline, condition, and safety wording explicit.
- Never log secrets, payment credentials, private keys, PINs, or sensitive identifiers.
- Any blocking async payment or contract action should use the shared loading pattern.

## State Boundaries

- Conversation identity selected from another screen belongs in router context or route params.
- Short-lived composer, sheet, and menu state belongs in the chat screen.
- Payment parsing and validation should move toward `src/native/domain/payment` as it grows.
- Chat delivery, unread, and message normalization should move toward `src/native/domain/chat` as it grows.

## i18n And Content

- System UI copy must use `useI18n`.
- Message bodies, participant names, and demo chat content are user/content data and do not need translation.

## Tests

When changing payment formatting/parsing, update and run:

- `tests/paymentUtils.test.js`

For future chat delivery or message state logic, add tests under `tests/` before wiring the UI.
