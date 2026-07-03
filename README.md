# Identra Mobile

Identra Mobile is an Expo React Native super-app prototype for digital identity, chat, news feed, payments, QR scanning, and Mini App discovery.

The app is built around real mobile surfaces for Android and iOS. It uses Expo Router for routes, React Native for UI, shared app shell/navigation infrastructure, replaceable demo data, and feature documentation close to each major screen group.

## Requirements

- Node.js compatible with Expo SDK 56.
- Expo Go compatible with SDK 56, or Android Studio/Xcode for emulator or simulator testing.
- Run `npm install` before starting the project for the first time.

## Run The App

```bash
npm start
npm run android
npm run ios
npm run web
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm test
```

## Current Product Navigation

The authenticated app starts on Chat List.

The bottom navigation has five main tabs:

- Chat
- News Feed
- Scan QR
- Payment
- Mini App

Identity is no longer a main tab. Identity wallet, Credentials, Profile, Security, Settings, Activity, and related secondary surfaces are opened from the side menu or direct routes.

## Project Structure

### Route Layer

- `app/`: Expo Router route entries. These files should stay thin and connect URL routes to real screens in `src/native/screens`.
- `app/_layout.tsx`: app-level providers and shared shell.
- `app/credentials/[credentialId].tsx`: credential detail route by route params.
- `app/smart-contracts/[postId].tsx`: smart-contract detail route by route params.
- `app/mini-app.tsx`: Mini App route entry; the main tab content is rendered through the keep-alive tab host.

### App Shell And Navigation

- `src/native/app/router/AppShell.tsx`: shared app frame, auth redirect, side menu, bottom navigation, and global chrome.
- `src/native/app/router/AppRouterContext.tsx`: shared router UI state such as side menu state, return screens, selected chat, share payloads, connection invitations, and News Feed chrome state.
- `src/native/app/router/MainTabKeepAliveScreens.tsx`: keep-alive host for main tab screens.
- `src/native/app/navigation/navigationTypes.ts`: `ScreenKey` and `TabKey` definitions.
- `src/native/app/navigation/navigationLogic.ts`: pure route, tab, active-tab, bottom-nav visibility, and return-screen logic.
- `src/native/app/navigation/navigationConfig.ts`: render config for bottom navigation and side menu.

### Store And Domain

- `src/native/store`: app store provider, initial state, persistence, and public exports.
- `src/native/domain/app-store/appStoreStateService.ts`: pure app-state transformations for credentials, activity logs, profile, settings, and demo-data removal.
- `src/native/domain/chat`: shared chat-domain logic.
- `src/native/domain/payment`: shared payment-domain logic.
- `src/native/domain/credentials`: shared credential-domain logic.

### Feature Screens

- `src/native/screens/auth`: onboarding, login, register, and OTP.
- `src/native/screens/chat-list`: Chat List, quick contacts, thought/reels previews, and chat search.
- `src/native/screens/chat`: conversation flow and chat action sheets for payments, QR, and smart contracts.
- `src/native/screens/news-feed`: feed, compose, search, notifications, live stream, and smart-contract detail.
- `src/native/screens/mini-app`: Mini App discovery, frequently used shortcuts, popular categories, recommendations, and collections.
- `src/native/screens/payment`: Payment/IDPay home, cards/accounts, transfers, receive money, mobile top-up, bill payment, transaction history, suggestions, and offers.
- `src/native/screens/identity`: identity wallet, credentials, credential detail, profile, security, and sharing flows.
- `src/native/screens/scan`: QR scanner.
- `src/native/screens/settings`: settings, activity, backup, display, data, help, and about surfaces.
- `src/native/screens/shared`: shared styles and helpers for secondary screens.

### Shared UI, Theme, Assets, And Data

- `src/native/components`: reusable cross-feature components.
- `src/native/components/icons/bottom-nav`: bottom navigation icons as React Native components.
- `src/native/components/LoadingOverlay.tsx`: shared loading overlay for blocking async work.
- `src/native/theme.ts`: shared colors, typography, spacing, radius, borders, shadows, layout, and component size tokens.
- `src/native/assets/assetManifest.ts`: static asset manifest used by screens and demo data.
- `src/native/data/demo`: replaceable demo data for features that do not yet use real APIs.
- `src/native/i18n`: i18n provider, `useI18n`, and Vietnamese/English locale files.

## Documentation Map

Start with these top-level docs:

- `codex.md`: implementation rules for Codex/agents and contributors who need exact guardrails.
- `design.md`: mobile design system, visual language, navigation patterns, and design review checklist.
- `docs/adr`: long-lived architecture decisions.
- `docs/runbooks`: operational checklists for quality gates and incident triage.

Feature and domain docs live next to the code they explain:

- `src/native/screens/auth/README.md`
- `src/native/screens/chat-list/README.md`
- `src/native/screens/chat/README.md`
- `src/native/screens/news-feed/README.md`
- `src/native/screens/mini-app/README.md`
- `src/native/screens/payment/README.md`
- `src/native/screens/identity/README.md`
- `src/native/screens/settings/README.md`
- `src/native/domain/chat/README.md`
- `src/native/domain/payment/README.md`
- `src/native/domain/credentials/README.md`

## Working On A Feature

1. Find the route in `app/` and the real screen implementation in `src/native/screens`.
2. Read the relevant feature README before changing behavior.
3. Use demo data from `src/native/data/demo` until a real API integration exists.
4. Add static images through `src/native/assets/assetManifest.ts`.
5. Keep reusable system UI copy in `src/native/i18n/locales/vi.ts` and `src/native/i18n/locales/en.ts`.
6. Move reusable business logic into a domain service or pure logic file when it becomes shared or testable.
7. Run the relevant targeted test plus `npm run lint`, `npm run typecheck`, and `npm test` before handoff.

For detailed implementation guardrails, use `codex.md`. For visual and interaction decisions, use `design.md`.
