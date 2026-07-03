---
name: Identra Mobile Design System Draft
version: 0.3.0-draft
status: review-only
source-of-truth:
  token-reference: "src/native/theme.ts"
  current-development-rules: "codex.md"
  proposed-development-rules: "codex-new.md"
tokens:
  color-light:
    background: "#F7F8FC"
    surface: "#FFFFFF"
    surface-muted: "#F1F4FB"
    surface-elevated: "#FFFFFF"
    text: "#11172F"
    text-secondary: "#596684"
    border: "#EEF2F7"
    primary: "#5B6CFF"
    primary-dark: "#355CFF"
    primary-hover: "#4A5AF0"
    secondary: "#8F9BFF"
    success: "#12B76A"
    warning: "#F57900"
    danger: "#FF3D47"
    purple: "#9747FF"
    gradient-start: "#5B6CFF"
    gradient-end: "#60A5FA"
    overlay: "rgba(11, 15, 26, 0.78)"
  color-dark:
    background: "#0B0F1A"
    surface: "#1F2937"
    surface-muted: "#374151"
    surface-elevated: "#11172F"
    text: "#F4F6FB"
    text-secondary: "#A5AFC4"
    border: "rgba(165, 175, 196, 0.18)"
    primary: "#7C8CFF"
    primary-dark: "#6B7BFF"
    primary-hover: "#6B7BFF"
    secondary: "#8F9BFF"
    success: "#22C55E"
    warning: "#FB923C"
    danger: "#FB7185"
    purple: "#B986FF"
    gradient-start: "#5B6CFF"
    gradient-end: "#3B82F6"
    overlay: "rgba(0, 0, 0, 0.82)"
  typography:
    family-base: "Inter"
    size-xs: 12
    size-sm: 14
    size-md: 16
    size-lg: 20
    size-xl: 28
    size-xxl: 36
    line-xs: 17
    line-sm: 20
    line-md: 23
    line-lg: 28
    line-xl: 36
    line-xxl: 44
    weight-regular: 400
    weight-medium: 500
    weight-semibold: 600
    weight-bold: 700
    weight-extra-bold: 800
    weight-black: 900
  spacing:
    xxs: 2
    xs: 4
    sm: 8
    md: 12
    lg: 16
    xl: 24
    xxl: 32
    xxxl: 48
    huge: 64
  radius:
    xs: 6
    sm: 8
    md: 12
    lg: 16
    xl: 20
    xxl: 24
    round: 999
  layout:
    min-width: 320
    reference-width: 390
    max-width: 430
    screen-padding: 16
    wide-screen-padding: 24
    app-bar-height: 56
    bottom-nav-height: 72
  touch-target:
    minimum: 44
    comfortable: 48
    large: 56
  icon-size:
    xs: 16
    sm: 20
    md: 24
    lg: 28
    xl: 32
---

## 1. Purpose

This file is a proposed replacement for `design.md`. It is not official until reviewed and approved.

Identra is now a mobile super app, not only an SSI wallet. The design system must support chat, news feed, payment, QR scanning, Mini App discovery, identity, credentials, settings, live content, notifications, and smart contracts.

The product feeling should stay:

- Clear
- Trustworthy
- Modern
- Lightweight
- Mobile-native
- Social enough for chat/feed, but still secure enough for identity/payment

## 2. Design Priority

When visual rules conflict, follow this order:

1. The latest approved user-provided design for the current screen.
2. The product-specific rules in the approved development rule file.
3. This design system after approval.
4. `src/native/theme.ts`.
5. Existing local screen patterns.

Use this document for direction and consistency. Use `src/native/theme.ts` as the token reference.

## 3. Core Visual Direction

Identra should feel like a calm, high-trust mobile app with enough social energy for feed and chat.

- Use airy light backgrounds and white surfaces.
- Prefer refined borders and low shadows over heavy cards.
- Use blue as the main trust/action color.
- Use rounded geometry, but avoid cartoonish softness.
- Keep information dense enough for real product use, but not visually cramped.
- Preserve hierarchy with whitespace, typography, and subtle grouping before adding more color.

Large gradients are allowed only when they clarify identity/security/social moments, such as hero credential cards, onboarding, verified states, QR/credential art, or special feed media. Do not use gradients as generic section backgrounds.

## 4. Mobile Frame

- Design first for `320px` to `430px` width.
- Reference width is `390px`.
- Desktop/web preview should keep a centered mobile frame with max width `430px`.
- Content must scroll vertically and never require horizontal scrolling.
- Do not design fake device chrome.
- Do not include fake time, battery, Wi-Fi, Dynamic Island, notch, home indicator, Android navigation bar, or phone frame.
- Respect real safe areas.

## 5. Color System

### Light Mode

- Background: `#F7F8FC`
- Surface: `#FFFFFF`
- Muted surface: `#F1F4FB`
- Text: `#11172F`
- Secondary text: `#596684`
- Border: `#EEF2F7`
- Primary: `#5B6CFF`
- Primary dark/action: `#355CFF`
- Success: `#12B76A`
- Warning: `#F57900`
- Danger: `#FF3D47`
- Purple accent: `#9747FF`

### Dark Mode

- Background: `#0B0F1A`
- Surface: `#1F2937`
- Muted surface: `#374151`
- Elevated surface: `#11172F`
- Text: `#F4F6FB`
- Secondary text: `#A5AFC4`
- Border: `rgba(165, 175, 196, 0.18)`
- Primary: `#7C8CFF`

Dark mode should keep the same hierarchy as light mode. Do not redesign the layout for dark mode.

### Semantic Colors

- Success is for verified, complete, active-safe, or ready-to-trade states.
- Warning is for pending, time-limited, or waiting states.
- Danger is for expired, failed, rejection, abuse report, destructive, or unavailable states.
- Purple is for secondary expressive moments, not primary CTAs.

Do not communicate state with color alone. Pair color with icon, text, or layout.

## 6. Typography

Base family is `Inter`.

Use these sizes:

- Metadata: `12px`
- Compact body: `14px`
- Body: `16px`
- Section title: `20px`
- Screen title: `28px`
- Special/onboarding title: `36px`

Weight guidance:

- Body: `400-500`
- Metadata: `500-600`
- Section and card titles: `700-900`
- Primary screen titles: `800-900`

Avoid using `36px` in normal screens. Reserve it for onboarding, hero, or special presentation states.

Body copy should be readable with line height around `1.45`. Dense metadata can be tighter, but should not fall below `12px`.

## 7. Spacing And Radius

Use the app spacing scale:

- `2`, `4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`

Default screen horizontal padding is `16px`; use `24px` for wider or presentation-style screens when needed.

Common radius:

- Small controls: `8-12px`
- Cards: `16-20px`
- Large sheets and floating surfaces: `24px`
- Pills and circular controls: `999px`

Avoid arbitrary spacing unless the screen needs a very specific alignment.

## 8. Shadows, Borders, And Depth

Depth should be subtle. Identra should not feel like a stack of heavy boxes.

Use these levels conceptually:

- Subtle: tiny iOS shadow, no Android elevation; good for bottom nav and light grouping.
- Card: light iOS shadow and Android elevation around `3`; good for major cards.
- Floating: stronger but still refined; good for FAB, bottom sheets, side menu.

Rules:

- Default to hairline borders and the theme `subtle` shadow for ordinary content blocks, list containers, quick-action tiles, promo cards, and form sections.
- Use the theme `card` shadow only for one or two primary surfaces on a screen, such as a true hero card or a high-priority summary. Do not apply it to repeated blocks in a flow.
- Reserve `floating` shadow for overlays that must visually detach from the screen, such as FABs, menus, or bottom sheets. Even there, keep the border hairline and avoid extra custom shadow values.
- Prefer dividers, spacing, typography, and muted surfaces before adding border or shadow.
- Do not combine heavy border and heavy shadow.
- Do not create custom shadow values for feature screens when the theme already has an appropriate level.
- Avoid nested cards more than two levels deep.
- When a new feature starts to feel boxed, raised, or cramped, compare against News Feed surfaces and reduce depth before shipping.
- If a screen feels cramped, reduce borders/shadows before reducing content quality.

## 9. App Shell

The app shell should feel like a centered, mobile-native frame with max width `430px` in preview environments and full native behavior on devices.

Shared visual surfaces:

- Safe-area-aware screen container
- Bottom navigation
- Side menu
- Main content area
- Screen headers or app chrome where applicable

These surfaces should stay visually consistent across features.

## 10. Navigation

### Bottom Navigation

The current approved bottom navigation is icon-only.

Items:

- Chat
- News Feed
- Scan QR
- Payment
- Mini App

Design rules:

- Height: base `72px`, excluding real safe-area handling.
- Use icon-only presentation. No text labels unless a later approved design brings them back.
- Active item uses primary/action blue.
- Inactive item uses text color with softened opacity.
- Do not add active pills or colored backgrounds unless approved.
- Icons should feel clear and substantial enough, not overly thin.
- Minimum item touch target is `44x44px`.
- Bottom nav can float on News Feed and may use subtle translucent/blur-like treatment where stable on Android and iOS.

### Side Menu

Side menu is for global controls, flow settings, and secondary destinations:

- Chat settings
- News Feed
- Mini App settings
- Identity
- Credentials
- Activity
- Settings
- Notifications
- Profile
- Security

Use it for less frequent navigation, not for temporary actions.

### App Header

Common header:

- Height around `56px`.
- Left side: back or menu button.
- Center/left title depending on screen family.
- Right side: at most two important actions.
- Icon buttons must have at least `44x44px` touch target.

News Feed and Chat can use custom headers to support search/social layout.

## 11. News Feed Design

News Feed is the most social surface and may use a lighter, more content-first style.

Key dimensions:

- Header overlay height: `74px`
- Tabs height: `62px`
- Overlay area: `136px`

Rules:

- Header and tabs can overlay content with subtle translucency/blur-like treatment.
- Scroll-linked animation should feel continuous and synchronized.
- Tabs must remain reachable and must not hide behind status bar/device UI.
- FAB should feel floating and quick, but should not cover important content.
- Feed rows use avatar column plus content body.
- Content text and media belong to the right of the avatar in standard feed rows.
- Verified badge uses the approved badge image asset.
- Images should use approved feed media assets with controlled size and aspect ratio.
- Smart contract cards should be compact and readable inside feed, not full detail pages squeezed into a card.
- Live preview cards should preserve content visibility; overlay comments and reactions must stay compact.

## 12. Chat And Social Messaging

Chat should feel fast, friendly, and compact.

Rules:

- Conversation rows should remain compact and scannable.
- Use avatars and status indicators carefully; presence dots appear only where meaningful.
- Thought bubbles can be expressive and customizable, but must not dominate the list.
- Media previews should stay compact and not cause conversation rows to grow excessively.
- Delivery status should be visually secondary.
- Official Identra conversations should use the official Identra logo mark.

Temporary full-screen social surfaces such as reels/thought viewers may use more immersive treatment, darker overlays, larger media, and stronger controls when appropriate.

## 13. Identity And Credentials

Identity screens must feel secure, transparent, and controlled.

Rules:

- Credential cards should show title, issuer, status, issue/expiry information, and key metadata.
- Verified status uses success color plus icon/text.
- Pending and expired states must be visually distinct.
- Sensitive attributes can be masked when appropriate.
- Detail pages use clear sections: status, credential hero, issuer, detailed attributes, actions.
- Sharing flows must make user choice obvious and show what data will be shared.
- Warnings should be explicit but not visually overwhelming.

## 14. Payment And Smart Contracts

Payment and smart contract surfaces should feel precise and trustworthy.

Rules:

- Amounts should be highly legible.
- Transaction states must be explicit: pending, ready, completed, failed, sold out, unavailable.
- Smart contract cards must clearly separate trade item, counter item, deadline, condition, and actions.
- Available and sold-out contract detail pages must visually reflect actual availability.
- Destructive or irreversible actions require clear hierarchy and confirmation where needed.

## 15. QR And Security Surfaces

QR and security screens should feel focused.

Rules:

- QR scanner camera preview should occupy most of the screen.
- Scanner frame should have strong contrast using primary/action blue.
- Always provide a clear exit/back action.
- QR sharing screens should explain expiration and trust boundaries.
- Safety warnings should be visible but concise.
- Avoid decorative complexity around QR codes that can reduce scan reliability.

## 16. Forms And Inputs

- Minimum input height: `48px`.
- Radius: around `12px`.
- Use labels when the field needs clarity; do not rely only on placeholders for important forms.
- Focus state should be visible with primary color.
- Error text must appear near the field and explain how to recover.
- Forms must work with mobile keyboard, autofill, and proper keyboard type.
- Fixed bottom actions must not be covered by keyboard or safe area.

## 17. Buttons And Controls

Primary button:

- Minimum height: `48px`.
- Primary/action blue background.
- White text.
- Semibold or stronger label.
- Radius `12-16px`, or pill where the screen language calls for it.

Secondary button:

- Minimum height: `44px`.
- Surface background.
- Thin border.
- Primary or text color label.

Icon button:

- Minimum `44x44px`.
- Icon size usually `20-28px`.
- Pressed state can use muted surface or opacity.

FAB:

- Circular.
- Strong enough to be discoverable.
- Uses floating shadow sparingly.
- Must not cover core actions or bottom nav.

## 18. Cards And Lists

Cards:

- Use white/surface background.
- Radius `16-20px`.
- Padding `12-16px` for dense cards, `16-24px` for important cards.
- Use hairline border and `subtle` shadow by default.
- Avoid applying card/floating shadow to every block in multi-step flows such as Auth, Payment, settings, or history screens.
- Repeated cards in grids or lists should look grouped, not lifted. One elevated hero plus lighter supporting blocks is usually enough.

Lists:

- Prefer rows and dividers for dense information.
- Minimum row height around `56px`.
- Align dividers with row content, not always full width.
- Long data lists should use scannable, reusable rows with clear rhythm and dividers.

Do not make every group a heavy card. Whitespace, typography, and dividers are often enough.

## 19. Modals, Sheets, And Overlays

Use bottom sheets for short selections, filters, confirmations, and contextual actions.

Bottom sheet rules:

- Top radius around `24px`.
- Include drag handle when it behaves like a draggable sheet.
- Keep primary and secondary actions near the bottom.
- Background overlay uses dark translucent overlay.
- Sheet content must fit smaller screens or scroll.

Use full modal screens for complex flows like compose post, search, live stream, QR, credential sharing, or smart contract detail.

## 20. Loading, Empty, And Error States

Loading:

- Use skeletons for list/card loading when practical.
- Use spinners for short scoped actions.
- Use blocking overlay only for important async actions where interaction must be locked.

Empty states:

- Explain why there is no data.
- Provide a clear next action when possible.
- Keep illustrations light.
- Empty layouts must remain valid when list data is absent.

Errors:

- Use plain language.
- Preserve user input.
- Provide retry or safe navigation.

## 21. Motion

Motion should explain state changes, not decorate.

Timing:

- Press feedback: around `120ms`.
- Small feedback: around `180ms`.
- Screen transitions: around `250ms`.
- Bottom sheets: around `250ms`.

News Feed chrome motion should be scroll-linked and continuous. Avoid delayed threshold animations for header, tabs, bottom nav, or FAB when the desired behavior is progressive scroll response.

Respect reduced-motion expectations where possible.

## 22. Accessibility

- Minimum touch target is `44x44px`.
- Text contrast should meet WCAG AA where practical.
- Main body text should generally be at least `14px`.
- Icon buttons require accessible labels.
- Use selected/expanded/disabled accessibility states when appropriate.
- Do not rely on color alone for meaning.
- Content order should make sense to screen readers.
- Support larger text without hiding primary actions.

## 23. Android And iOS

Every design must work on Android and iOS.

- Respect display cutouts and safe areas.
- Do not rely on hover.
- Do not rely on one gesture without an alternative visible control.
- Avoid fixed device-height assumptions.
- Avoid iOS-only or Android-only interaction patterns unless a platform fallback exists.
- System APIs should have fallback UI when unsupported.

## 24. Feature Surface Guidance

### Onboarding And Auth

- More expressive visuals are allowed.
- Keep CTAs clear and reachable.
- Explain privacy/security benefits in plain language.

### Chat List

- Prioritize quick scanning and action.
- Search should be prominent.
- Quick contacts should not push important conversations too far down.

### News Feed

- Prioritize content rhythm.
- Keep chrome lightweight and responsive.
- Media should not become oversized unless it is an immersive detail surface.

### Mini App

- Prioritize fast discovery and repeat use.
- Match Payment Home spacing, button scale, and tile rhythm.
- Keep catalog shortcuts compact and visually even.
- Render banner artwork from its source aspect ratio.
- Do not imply a real open/install action until the mini app runtime or API is connected.

### Identity

- Prioritize trust, verification, and user control.
- Credentials and data sharing should be explicit.

### Settings

- Prioritize clarity and predictability.
- Group account, privacy, and support areas cleanly.
- Avoid heavy cards for every row.

## 25. Do And Do Not

Do:

- Follow approved design tokens.
- Keep screens mobile-first.
- Use subtle depth.
- Keep lists scannable.
- Make states explicit.
- Protect content from safe areas, keyboard, and bottom nav.
- Keep visual language consistent across feature surfaces.

Do not:

- Recreate device chrome.
- Use web-only layout assumptions.
- Use heavy shadows and borders by default.
- Put too many primary actions on one screen.
- Let sample content dictate permanent UI constraints.
- Expand mobile content into a desktop dashboard.
- Hide critical actions under overlays or navigation.

## 26. Design Review Checklist

- [ ] App UI was separated from device UI in references.
- [ ] Layout works at `320px`, `390px`, and `430px`.
- [ ] Safe areas are respected.
- [ ] Bottom nav matches current icon-only product rule.
- [ ] Global navigation remains visually consistent across screens.
- [ ] Text hierarchy is clear.
- [ ] Borders and shadows are subtle.
- [ ] Long content can scroll fully.
- [ ] Empty and no-result states are designed.
- [ ] Loading/error states are covered for async flows.
- [ ] Android and iOS constraints were considered.
- [ ] Accessibility labels, touch targets, and contrast were considered.

## 27. Decision Rule

If a reference design conflicts with the current product architecture or approved navigation model, do not copy it blindly. Preserve the product architecture, identify the app-UI intent, and ask for clarification when the intended behavior is ambiguous.
