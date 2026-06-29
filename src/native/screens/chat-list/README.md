# Chat List Screen

This folder owns the authenticated landing screen for conversations and social entry points.

## Scope

- Conversation list and row presentation.
- Quick contacts.
- Chat search UI and search logic.
- Create-chat entry.
- Thought/reels preview surfaces that are launched from the chat list.

The actual conversation surface lives in `src/native/screens/chat`.

## Important Files

- `ChatListScreen.tsx`: screen composition and list rendering.
- `ConversationRow.tsx`: conversation preview row.
- `ChatListAvatar.tsx`: avatar and official/verified presentation.
- `ChatListSearchComponents.tsx`: search UI pieces.
- `chatListLogic.ts`: pure preview and delivery-status logic.
- `chatSearchLogic.ts`: pure chat search logic.
- `ChatListData.ts`: local screen data shaping.
- `src/native/data/demo/chatListDemoData.ts`: replaceable demo data.

## Business Rules

- Conversation previews must be derived from normalized conversation fields.
- Delivery status is shown only for messages sent by the current user.
- Group sender names are shown only when the latest message is from another participant.
- Media-only messages must fall back to a compact media label.
- Multiple media thumbnails show at most four visible items and an overflow count.
- Official Identra conversations must use the official logo, not a generic demo avatar.
- The list can become long, so keep it virtualized.

## Conversation Preview Data Contract

Each conversation preview should be derived from normalized data fields:

- `id`: stable conversation ID.
- `name`: conversation title or participant display name.
- `message`: latest message text or caption, empty for media-only messages.
- `time`: formatted timestamp for display.
- `avatar`: semantic avatar kind such as `photo`, `group`, `identra`, or `initial`.
- `avatarSource`: optional image source for real avatars.
- `initials`: fallback when no image is available.
- `online`: whether direct-contact presence is meaningful.
- `verified`: whether the conversation is official or verified.
- `muted`: whether notifications are muted.
- `unread`: unread count.
- `lastMessageFromMe`: whether the latest message was sent by the current user.
- `deliveryStatus`: `sent`, `seen`, or `pending`.
- `groupSender`: sender display name for group conversations.
- `media`: optional media or attachment preview metadata.

## State Boundaries

- Keep selection and cross-screen navigation state in the app router context when it affects another route.
- Keep local UI state such as temporary menus, search input, and local filters inside the screen.
- Move reusable pure logic into `chatListLogic.ts`, `chatSearchLogic.ts`, or the future `src/native/domain/chat` service.

## i18n And Content

- System labels, buttons, tabs, empty states, accessibility labels, and menu copy must use `useI18n`.
- User names, latest messages, and demo conversation content are user/content data and do not need translation.

## Tests

When changing preview, search, or row logic, update and run:

- `tests/chatListLogic.test.js`
- `tests/chatSearchLogic.test.js`

Also run:

- `npm run lint`
- `npm run typecheck`
- `npm test`
