# Chat Domain

This folder is the target home for chat business logic that should be independent from React UI.

At the moment, some chat logic still lives close to screens:

- `src/native/screens/chat-list/chatListLogic.ts`
- `src/native/screens/chat-list/chatSearchLogic.ts`
- `src/native/screens/chat/paymentUtils.ts`

Move logic here when it becomes shared, stateful, or important enough to test as domain behavior.

## Domain Responsibilities

- Conversation ordering and grouping.
- Message preview derivation.
- Delivery status visibility.
- Read/unread count calculation.
- Muted/pinned/archive state rules.
- Group sender display rules.
- Media preview presentation rules.
- Future send/retry/failure state transitions.

## Invariants

- Delivery status is visible only for messages sent by the current user.
- Messages sent by other users never show the current user's delivery state.
- Group sender labels are shown only for group messages from another participant.
- Media-only messages must still produce a readable preview.
- Conversation row logic must not require translated demo content.
- Official Identra conversations must keep official branding separate from generic user avatars.

## Boundaries

- Domain functions should accept plain data and return plain data.
- Domain functions should not import React, React Native, Expo Router, UI components, theme, or i18n hooks.
- UI can translate labels after domain logic returns semantic values.
- Persistence belongs in the store layer, not in this domain folder.

## Testing

Add or update tests when changing:

- conversation preview derivation
- delivery-status rules
- unread/read transitions
- media preview presentation
- conversation search/filter logic

Relevant current tests:

- `tests/chatListLogic.test.js`
- `tests/chatSearchLogic.test.js`
