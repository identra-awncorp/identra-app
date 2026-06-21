---
name: SSI Mobile Design System
version: 0.2.0-alpha
tokens:
  color-light:
    primary: "#5B6CFF"
    primary-hover: "#4A5AF0"
    secondary: "#8F9BFF"
    background: "#F7F8FC"
    surface: "#FFFFFF"
    text-primary: "#1F2937"
    text-secondary: "#6B7280"
    border: "#E5E7EB"
    success: "#22C55E"
    gradient-start: "#5B6CFF"
    gradient-end: "#60A5FA"

  color-dark:
    background: "#0B0F1A"
    surface: "#111827"
    surface-elevated: "#1F2937"
    text-primary: "#E5E7EB"
    text-secondary: "#9CA3AF"
    border: "#374151"
    primary: "#7C8CFF"
    primary-hover: "#6B7BFF"
    gradient-start: "#5B6CFF"
    gradient-end: "#3B82F6"
    success: "#22C55E"

  typography:
    font-family-base: "'Inter', sans-serif"
    font-size-xs: "12px"
    font-size-sm: "14px"
    font-size-md: "16px"
    font-size-lg: "20px"
    font-size-xl: "28px"
    font-size-2xl: "36px"
    font-weight-regular: 400
    font-weight-medium: 500
    font-weight-semibold: 600
    font-weight-bold: 700

  spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    2xl: "48px"
    3xl: "64px"

  radius:
    sm: "8px"
    md: "12px"
    lg: "20px"
    pill: "999px"

  shadow:
    sm: "0 2px 8px rgba(0,0,0,0.05)"
    md: "0 4px 16px rgba(0,0,0,0.08)"
    lg: "0 10px 30px rgba(0,0,0,0.12)"
---

## Overview

This is the design system for the SSI (Self-Sovereign Identity) mobile app, focused on identity management, credentials, and safe personal data sharing.

The design keeps the original system's **modern, minimal, and high-tech** spirit. The interface uses airy light backgrounds, white cards, a blue primary color, and subtle gradients to create a sense of trust, security, and control.

The system aims to provide:
- A clear mobile experience with convenient one-handed interactions
- Priority for important content and actions on small screens
- Consistent navigation across core features
- A feeling of security, transparency, and trustworthiness

---

## Mobile Principles

### Mobile-First

- Design by default for screens from `320px` to `430px` wide.
- Main content should use a single-column layout.
- Do not depend on hover; every interactive state must work well with touch.
- On larger screens, keep the app frame at a maximum width of `430px` and center it to preserve the mobile experience.

### One-Handed Use

- Frequent actions should be placed in the lower half of the screen or inside bottom navigation.
- The primary action of a screen should be easy to reach with the thumb.
- Standalone icon buttons must have a minimum touch target of `44x44px`.

### Content Hierarchy

- Each screen should have only one main goal.
- Important information appears first; secondary details expand only when needed.
- Use cards, dividers, and whitespace for grouping instead of adding many colors or shadows.

---

## Colors

Keep the original system color palette for both light mode and dark mode.

### Primary (`#5B6CFF`)

Use for primary CTAs, active bottom navigation states, focus rings, links, and important accents.

Do not use primary as the background for large content areas. A screen should generally have only one prominent primary action.

### Background (`#F7F8FC`)

Use as the overall app background in light mode. It helps white cards stand out while keeping the interface light and airy.

### Surface (`#FFFFFF`)

Use for cards, app bars, bottom navigation, forms, modals, and bottom sheets.

### Text Primary (`#1F2937`)

Use for headings, main content, and important information. Ensure WCAG AA contrast.

### Text Secondary (`#6B7280`)

Use for descriptions, metadata, secondary labels, and less important states.

### Border (`#E5E7EB`)

Use for dividers, inputs, and card borders. Borders should stay subtle so the interface does not feel heavy.

### Success (`#22C55E`)

Use for verified, completed, or secure connection states. Do not use it as a replacement for the primary CTA.

### Dark Mode

- Background: `#0B0F1A`
- Surface: `#111827`
- Surface elevated: `#1F2937`
- Text primary: `#E5E7EB`
- Text secondary: `#9CA3AF`
- Border: `#374151`
- Primary: `#7C8CFF`

Dark mode keeps the same structure and hierarchy as light mode, changing only the corresponding color tokens.

---

## Typography

### Font Family

`Inter, sans-serif`

A modern font that is readable on small screens and suitable for a technology product.

### Mobile Heading

- Screen title: `28px / Bold`
- Section title: `20px / Semibold`
- Card title: `16px / Semibold`
- Compact label: `14px / Semibold`

Do not use `36px` for normal app content; this token is reserved for onboarding or special introduction screens.

### Body

- Default: `16px / Regular`
- Compact body: `14px / Regular`
- Metadata: `12px / Medium`

Body text should use a line height of about `1.45-1.6`. Do not use font sizes smaller than `12px`.

---

## App Frame

### Mobile Viewport

- Reference design width: `390px`
- Supported width: `320px-430px`
- Maximum width on desktop: `430px`
- App background: `{color.background}`
- Content scrolls vertically, never horizontally

### Safe Area

- Respect `safe-area-inset-top` and `safe-area-inset-bottom`.
- Do not place CTAs, inputs, or important content too close to camera cutouts, status bars, or home indicators.
- Bottom navigation must include bottom safe area padding on supported devices.

### Content Container

- Default horizontal padding: `16px`
- Horizontal padding on wider screens: up to `24px`
- Space between sections: `24px`
- Space between related items: `8px-16px`

### Grid

- Use a `4-column` grid for quick actions and compact dashboards.
- Default gap: `8px` or `12px`.
- Main content and forms should always prioritize a single column.
- Use two columns only when each item still preserves touch target size and readable content.

### Vertical Structure

A standard screen consists of:
1. Status bar or top safe area
2. App bar
3. Scrollable content area
4. Fixed CTA when required by the task
5. Bottom navigation for top-level screens

---

## Navigation

### App Bar

- Content height: `56px`
- Background: `{color.surface}`, or transparent when it matches the screen background
- Horizontal padding: `16px`
- Title aligned left
- Back or menu button on the left; at most two actions on the right
- Icon visual size: `20-24px`; minimum touch target: `44x44px`

The app bar may be sticky on long screens. Add a bottom border only when it is needed to separate it from content.

### Bottom Navigation

- Base height: `72px`, excluding safe area
- Background: `{color.surface}` with subtle blur when appropriate
- Border-top: `1px solid {color.border}`
- Use `3-5` top-level navigation items
- Active item uses `{color.primary}`; inactive items use `{color.text-secondary}`
- Each item displays an icon and short text label below it, matching the approved design
- The active item's icon and text label both use `{color.primary}`
- Do not add a rounded background, pill, or color block behind the active item if the design image does not include one
- Text labels do not replace accessibility labels

Do not use bottom navigation for temporary actions or subflows.

### Side Drawer

Side drawers are only for secondary features, account information, or less frequently used items. They do not replace bottom navigation for core areas.

### Bottom Sheet

Use bottom sheets for short selections, confirmations, or contextual actions.

- Top corner radius: `{radius.lg}`
- Padding: `{spacing.md}` or `{spacing.lg}`
- Include a drag handle when the sheet is draggable
- Do not cover context that is necessary for the user's decision

---

## Components

### Primary Button

- Height: minimum `48px`
- Background: `{color.primary}`
- Text: white
- Horizontal padding: `20px`
- Radius: `{radius.md}` or `{radius.pill}`
- Font weight: `600`
- Pressed state: `{color.primary-hover}`
- The primary CTA in a form or flow should generally be `100%` wide

### Secondary Button

- Height: minimum `44px`
- Border: `1px solid {color.border}`
- Background: `{color.surface}`
- Text: `{color.text-primary}`

Use for secondary actions that should not visually compete with the primary button.

### Icon Button

- Minimum touch target: `44x44px`
- Icon: `20-24px`
- Must include an accessibility label
- Pressed state can use a low-opacity primary background or elevated surface

### Card

- Background: `{color.surface}`
- Radius: `16-20px`
- Padding: `{spacing.md}` or `{spacing.lg}`
- Border: `1px solid {color.border}` when needed
- Shadow: `{shadow.sm}`

Cards group credentials, security states, recent activity, and quick tasks. Avoid nesting cards more than two levels deep.

### List Item

- Minimum height: `56px`
- Vertical padding: `12-16px`
- May include a leading icon/avatar, title, supporting text, and trailing action
- Dividers align with content and do not need to span the full width

### Input and Form

- Height: minimum `48px`
- Border: `1px solid {color.border}`
- Radius: `{radius.md}`
- Horizontal padding: `16px`
- Labels are always visible; do not use placeholders as labels
- Focus: border or ring `{color.primary}`
- Errors appear near the input and describe how to fix the issue

Long forms should be divided into clear sections. Submit CTAs should be placed at the end of the form or fixed at the bottom when needed.

### Toggle

- Minimum touch target: `44px`
- Enabled state uses `{color.primary}`
- Always paired with a clear label
- Sensitive changes require confirmation or an explanation of consequences

### Credential Card

- Display credential type, issuer, verification status, and expiration
- Valid state uses `{color.success}`
- The entire card can be tappable to open details
- Sensitive information is masked by default when appropriate

### QR Scanner

- Camera preview occupies most of the content area
- Scanner frame has high contrast using `{color.primary}`
- Include short instructions, processing status, and an option to upload an image
- Always provide a clear way to exit or go back

### Modal

Use modals only for important confirmations or alerts that must block the flow. On mobile, prefer bottom sheets for ordinary choices.

---

## States and Feedback

### Loading

- Use skeletons for lists and cards.
- Use spinners for short actions with clear scope.
- Do not lock the whole screen if only one component is loading.

### Empty State

- Briefly explain why no data is available.
- Provide a clear next action.
- Illustrations, if present, should be lightweight and should not overpower the CTA.

### Error

- Describe the issue in plain language.
- Preserve the data the user has already entered.
- Allow retrying or returning to a safe state.

### Touch Feedback

- Every interactive element needs a clear pressed state.
- Use very subtle scale, background color change, or opacity change.
- Feedback animations should complete within `150-250ms`.

---

## Motion

- Motion should explain state changes, not merely decorate.
- Screen transitions: `200-300ms`.
- Press feedback: `100-150ms`.
- Bottom sheets appear from the bottom.
- Respect `prefers-reduced-motion`.
- Do not use many simultaneous animations on screens containing sensitive data.

---

## Do's and Don'ts

### Do's

- Keep a clear single-column layout on small screens
- Place frequent actions in easy-to-reach areas
- Use primary color for CTAs and active states
- Keep spacing on an `8px` system
- Use subtle shadows and borders to create hierarchy
- Show verification state and sharing permissions transparently
- Check the interface in both light mode and dark mode

### Don'ts

- Do not directly move multi-column desktop layouts to mobile
- Do not depend on hover to communicate information
- Do not place too many primary CTAs on one screen
- Do not use touch targets smaller than `44x44px`
- Do not place important content under bottom navigation or safe area
- Do not mix many font families
- Do not use gradients or primary color as the background for large content areas
- Do not use heavy borders or shadows
- Do not break the spacing system with arbitrary values

---

## Accessibility

- Text contrast must be at least `4.5:1` according to WCAG AA
- Minimum touch target is `44x44px`
- Main content font size should be at least `14px`
- Icon buttons must have accessible labels
- Focus state must always be visible when using a keyboard or assistive device
- Do not communicate state using color alone
- Support larger text sizes without losing content or primary actions
- Content should read in a logical order for screen readers

---

## Responsive Preview

The app is mobile-first but can be viewed on desktop for demos:

- Keep the app frame at a maximum width of `430px` and center it on the screen.
- A border and outer radius may be added to the frame to simulate a device.
- Do not expand the content into a landing page or desktop dashboard.
- Functionality, content order, and navigation must match the real mobile version.

---

## Summary

This mobile design system preserves three core values:

- **Clarity**
- **Trust**
- **Modern minimalism**

Every screen should feel easy to understand, easy to use with one hand, transparent about data, and trustworthy in every action.
