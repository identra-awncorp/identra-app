# Identra Interface Development Rules

The rules in this document must be applied when designing, editing, or comparing the project's interface.

## 1. Distinguish App UI From Device UI

- Reference images may contain both app UI and UI shown by the operating system or device.
- Implement only the elements that belong to the app UI.
- Do not implement fake status bars, including:
  - System time
  - Battery state
  - Wi-Fi or mobile network state
  - Dynamic Island, notches, or camera cutouts
- Do not implement fake home indicators, system navigation bars, or Android navigation buttons.
- Do not add phone frames, device bezels, or cameras to the app.
- Simulate these elements only when the user explicitly requests a device mockup or a presentation inside a phone frame.

## 2. When Comparing Against Design Images

- Before editing code, classify each element in the image as:
  1. App UI
  2. Operating system or device UI
  3. Decorative content for the mockup only
- Match the layout, colors, typography, spacing, radius, shadow, and icons of the app UI portion.
- Do not mechanically copy the entire reference image.
- Preserve existing functionality and interaction flows unless the request explicitly asks for a change.

## 3. Rules for the Expo React Native App

- The project uses Expo and React Native; do not implement screens with HTML, DOM, or CSS.
- The operating system is responsible for displaying the status bar and system navigation area.
- The interface must start with the app bar or the first app content.
- Respect safe areas with `SafeAreaView` and `useSafeAreaInsets`; do not redraw system UI.
- The app's bottom navigation may be shown, but it must not contain a fake home indicator.
- The latest approved bottom navigation is icon-only: Chat, News Feed, Scan QR, Payment, Identity.
- Do not render text labels inside the bottom navigation unless a later approved design explicitly brings them back.
- The active bottom navigation item uses the primary color for the icon; do not add rounded backgrounds or pills if the design does not include them.
- When the bottom navigation design image changes, prioritize matching the latest image's icon, label, color, spacing, border, and height.
- Bottom navigation must continue to be shown on `screen-credentials-library`.
- Card shadow, elevation, and border must match the latest design image; do not automatically use a shared shadow if it makes the UI heavier than the image.
- On main screens, cards should use only very subtle shadow; prefer refined borders and avoid high elevation.
- Do not lock the UI to a specific device height if that breaks the experience on real screens.
- Camera, biometric, clipboard, and secure storage APIs must use Expo modules compatible with both Android and iOS.

## 4. Implementation Rules

- Prefer existing components and design tokens.
- All reusable UI copy must go through `src/native/i18n` and `useI18n`; do not hardcode Vietnamese or English UI text directly in components, navigation config, accessibility labels, tabs, buttons, empty states, or modal copy.
- Navigation/config files should store translation keys such as `labelKey` and `descriptionKey`; the rendering component should call `t(...)`.
- Demo/user-generated content may remain in `/data/demo` because it represents replaceable API data, but labels that describe UI state or actions must still be translated through i18n.
- Multilingual text and demo content must be saved as clean UTF-8. Before handing off text-heavy changes, scan edited files for mojibake patterns such as `Ã`, `Ä`, `Æ`, `áº`, `á»`, `â€`, `Â·`, or `�`; valid Vietnamese content must display correctly in source.
- The only official app logo is `src/assets/images/identra-logo.png`. Whenever the interface needs to display the app logo or Identra brand, it must use this PNG asset through the `AppLogo` or `AppBrandLogo` component; do not reuse the SVG and do not build the logo manually with icons, shapes, or replacement wordmarks.
- Static image assets must be declared in `src/native/assets/assetManifest.ts`; components, screens, and data modules must import from the manifest instead of calling `require(...)` directly. Keep manifest asset declarations as static `require(...)` calls so Metro can bundle them correctly.
- When handling asynchronous tasks, API calls, authentication, signing/sending transactions, QR creation, or any action that may take time, lock interaction and show the shared `LoadingOverlay` component until the task completes or fails; do not create separate one-off loading overlays unless there is a clear design requirement.
- Every screen or view must have its own stable and unique `nativeID` and `testID`.
- Screen IDs use the `screen-` prefix and kebab-case names, for example `screen-wallet-home` or `screen-data-request`.
- States that form different screens must have different IDs.
- Do not use screen IDs for cards, items, or decorative elements.
- Do not add an element only because it appears in the chrome of a reference image.
- Every icon button must have an `accessibilityLabel`.
- Minimum touch target is `44x44px`.
- Content must not be covered by bottom navigation.
- Check the interface at `320px`, `390px`, and `430px` widths.
- Check both light mode and dark mode if the edited area supports both modes.
- The "Activity history" quick menu must open `screen-activity`; do not recreate `screen-wallet-history-log`.
- Demo data must be fully removable, and every related list must still show a valid empty state.

## 5. Chat List Rendering Logic

The chat list must use the same display logic on mobile, web, and desktop. Platform-specific components may differ, but the underlying data semantics and rendering rules must stay consistent.

### Required Conversation Fields

Each chat preview should be derived from a normalized conversation item with these semantic fields:

- `id`: stable conversation ID.
- `name`: conversation title or participant display name.
- `message`: latest message text or caption. Use an empty string when the latest message is media-only.
- `time`: formatted timestamp for display.
- `avatar`: semantic avatar kind, such as `photo`, `group`, `identra`, or `initial`.
- `avatarSource`: optional image source for real user or group avatars.
- `initials`: fallback initials when no avatar image is available.
- `online`: whether a direct contact is currently online.
- `verified`: whether the conversation is an official or verified identity.
- `muted`: whether notification mute is enabled for the conversation.
- `unread`: unread message count. Omit or use `0` when there are no unread messages.
- `lastMessageFromMe`: whether the latest message in the conversation was sent by the current user.
- `deliveryStatus`: latest outgoing message state. Valid values are `sent`, `seen`, and `pending`.
- `groupSender`: display name of the latest sender in a group conversation when the latest message is not from the current user.
- `media`: optional preview metadata for media or attachment messages.

### Delivery Status

- Show delivery status only when `lastMessageFromMe === true`.
- Do not show sent, seen, or pending indicators when the latest message was sent by another participant, even in direct conversations.
- Do not show delivery status for system conversations unless the current user actually sent the latest message.
- `sent` displays a single check icon.
- `seen` displays a double check icon.
- `pending` displays a pending or clock icon to indicate the message has not been sent yet.
- A conversation may have `deliveryStatus`, but the UI must still suppress it when `lastMessageFromMe !== true`.

### Group Conversations

- When the latest group message is from another participant, show `groupSender` on the right side of the message preview row.
- When the latest group message is from the current user, do not show `groupSender`; show delivery status instead when available.
- Group conversations can still be muted, unread, verified, and include media previews.

### Avatar, Online, and Mute Indicators

- Prefer `avatarSource` for real user and group avatars.
- Fall back to `initials` only when no avatar image is available.
- Official Identra conversations must use the official app logo through `AppLogo` or `AppBrandLogo`, not a demo avatar.
- Show the online dot only for real contacts where online presence is meaningful.
- Show the mute indicator beside or over the avatar when `muted === true`.
- Mute state does not hide unread badges or delivery status.

### Message and Media Preview

- Text-only latest messages display the text with single-line truncation.
- Media-only latest messages use an empty `message` and display the media label:
  - `photo` displays `Photo`.
  - `gif` displays `GIF`.
  - `file` displays the file name when available, otherwise `File`.
- When a media message also has text, show the media thumbnail and the text caption.
- Photo previews must show thumbnails beside the text or media label.
- Multiple photos display at most four thumbnails. If there are more than four, the last visible thumbnail shows an overflow count such as `+2`.
- GIF and file previews follow the same structure: a compact leading preview icon or thumbnail plus the label or caption.
- The message preview row must remain compact and must not force the conversation row to grow excessively.

### Unread and Text Weight

- Unread conversations should make the conversation title and relevant preview text more visually prominent.
- Unread count greater than `1` displays as a compact numeric badge.
- Unread count equal to `1` may display as a dot or a compact badge depending on the platform design.
- Unread state must not override media preview semantics.

### Quick Contacts and Thought Bubbles

- Quick contacts can display short thought bubbles above avatars.
- Thought content may accept up to `60` characters in data, but the UI preview must use a fixed-size bubble.
- The thought bubble displays at most two lines and truncates overflow with an ellipsis.
- Thought bubble color is user-customizable and must not be forced to use global design tokens.
- Thought bubbles may slightly overlap the avatar, but must not push quick contacts too far apart or cover the search field.
- Quick contact new-post state should be visually distinct, such as with a blue avatar ring.

### Demo Data Coverage

When building or refreshing demo data for the chat list, include enough examples to cover:

- Direct chat where the current user sent the latest message with `sent`.
- Direct chat where the current user sent the latest message with `seen`.
- Direct chat where the current user sent the latest message with `pending`.
- Direct chat where another participant sent the latest message and no delivery status is shown.
- Group chat where another participant sent the latest message and `groupSender` is shown.
- Group chat where the current user sent the latest message and delivery status is shown.
- Muted conversations.
- Unread conversations with both dot-style and count-style presentation where applicable.
- Photo-only, photo-with-caption, multiple-photo, GIF, and file previews.
- Official Identra or system conversation using the official app logo.

Demo data must be replaceable by real API data without changing rendering logic.

## 6. Android and iOS Support

- Every mobile interface and feature must work well on both Android and iOS devices.
- Do not design or implement only according to behavior, dimensions, or conventions specific to one operating system.
- Do not simulate the Android or iOS status bar, home indicator, navigation buttons, or navigation gestures.
- Respect safe areas on iOS devices with camera cutouts and Android devices with display cutouts.
- Use `react-native-safe-area-context` to read correct safe areas on each device.
- Layout must flex with the React Native window size; do not use fixed device-height values.
- Important content and actions must not be covered by:
  - The virtual keyboard
  - App bottom navigation
  - Gesture areas or system navigation bars
- Do not depend on hover. Every interaction must work with touch.
- Do not depend on a single swipe gesture; always provide a clear button or alternative action.
- Forms must work correctly with the virtual keyboard, autofill, and suitable `keyboardType`.
- Verify compatibility with a bundle or Android/iOS simulation environment, not only with web preview.
- Features that depend on camera, sharing, clipboard, biometrics, or system permissions must include a fallback when the API is not supported.

## 7. Pre-Completion Checklist

- [ ] Every screen has its own unique `screen-*` ID.
- [ ] There is no fake time, battery, Wi-Fi, mobile network state, or Dynamic Island.
- [ ] There is no fake home indicator or system navigation bar.
- [ ] There is no phone frame unless the user requested a mockup.
- [ ] The app bar and content start at the correct position.
- [ ] Bottom navigation contains only app navigation.
- [ ] Bottom navigation icons and active state match the latest design image.
- [ ] Card shadow and elevation are not heavier than the design image.
- [ ] Content is not covered and can scroll fully.
- [ ] The interface matches the app-UI portion of the reference image.
- [ ] Existing functionality and interactions still work.
- [ ] The interface works well on both Android and iOS.
- [ ] Safe area, system navigation area, and virtual keyboard do not cover content.
- [ ] A corresponding Android or iOS bundle or simulation environment has been checked.
- [ ] Device-dependent APIs include fallbacks.
- [ ] Type-check and build pass.

## 8. Decision Rule

When it is unclear whether an element in an image belongs to the app or the device, do not implement that element until it has been verified from project context or by asking the user.
