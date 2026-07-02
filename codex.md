# Identra Development Rules

The rules in this document apply when designing, coding, refactoring, reviewing, testing, or comparing the Identra mobile app against reference designs.

## 1. Rule Priority

When rules conflict, follow this order:

1. The user's latest explicit request.
2. This development rule file.
3. `design.md` for visual design principles, UI behavior, and design tokens.
4. Existing code architecture and local patterns.
5. General React Native, Expo, and TypeScript best practices.

Before coding or changing UI, read the required documents in this order:

1. Read `codex.md`.
2. Read `design.md`.
3. If the target feature or domain has a nearby `README.md` or `FEATURE_RULES.md`, read it before editing that feature.

For example, read `src/native/screens/news-feed/README.md` before changing News Feed UI, and read `src/native/domain/payment/README.md` before changing payment business logic. If a requirement is unclear or would require changing architecture, ask before implementing.

Document boundary:

- `codex.md` owns development behavior: stack decisions, project structure, routing, store/domain boundaries, i18n enforcement, asset import rules, test/lint expectations, security implementation constraints, and worktree safety.
- `design.md` owns product design: visual direction, tokens, typography, spacing, radius, shadows, layout rhythm, component appearance, motion, and platform design constraints.
- `codex.md` may reference design rules only as implementation obligations. It should not become a second design system.
- `codex.md` should not contain detailed business rules for individual features. Put those rules in the relevant feature/domain `README.md` or `FEATURE_RULES.md`.
- `design.md` may mention architecture only when needed to explain product-level UI surfaces. It should not define file placement, route ownership, store/domain implementation, lint commands, test commands, or git workflow.

## 2. Product And Stack

- Identra is an Expo React Native mobile super app for digital identity, chat, news feed, payment, QR scanning, credentials, and settings.
- The project uses Expo SDK 56, React Native, TypeScript, and Expo Router.
- Do not implement app screens with HTML, DOM APIs, CSS files, or web-only UI assumptions.
- Every feature must work well on both Android and iOS.
- Platform APIs such as camera, clipboard, biometrics, haptics, safe area, system UI, and linking must use Expo or React Native APIs that support Android and iOS.
- Web preview may be used for quick inspection, but it is not enough to prove mobile compatibility.

## 3. Device UI Boundaries

- Reference images may include both app UI and operating-system/device UI.
- Implement only app UI.
- Do not implement fake status bars, including system time, battery, Wi-Fi, mobile signal, Dynamic Island, notch, camera cutout, or status icons.
- Do not implement fake home indicators, Android navigation bars, device bezels, phone frames, or camera holes.
- Use `expo-status-bar`, `SafeAreaView`, and `useSafeAreaInsets` to respect real device UI.
- If a reference contains device chrome, classify it as non-app UI unless the user explicitly asks for a phone mockup.

## 4. Design Interpretation

- Before comparing against a design image, classify each visible element as app UI, operating-system UI, or decorative mockup content.
- Match the app UI portion: layout, spacing, typography, color, radius, icon treatment, border, and shadow.
- Do not mechanically copy the full screenshot when it contains device chrome.
- Preserve existing functionality and navigation flow unless the user explicitly requests a behavior change.
- Treat `design.md` as the mobile visual foundation, but respect later approved product decisions in this file.
- Visual hierarchy, spacing, shadows, borders, and responsive width expectations are governed by `design.md`; do not override them in code without approval.

## 5. Project Architecture

### Route Layer

- `app/` is the Expo Router route layer.
- Files in `app/` should be thin route entries that connect URL routes to screen components in `src/native/screens`.
- Do not put large UI implementations, business logic, demo data, or styling systems directly in route files.
- Use route params for detail pages, for example:
  - `app/credentials/[credentialId].tsx`
  - `app/smart-contracts/[postId].tsx`
- When adding a screen that needs a route, add the route file in `app/` and the actual implementation under `src/native/screens/<feature>`.

### App Shell And Router State

- `src/native/app/router/AppShell.tsx` owns the shared app frame, auth redirect, bottom navigation, side menu, and global route chrome.
- `src/native/app/router/AppRouterContext.tsx` owns shared router UI state such as side menu state, return screens, selected chat, share payloads, connection invitations, and News Feed chrome animation state.
- Do not duplicate shell, bottom navigation, side menu, auth redirect, or global route state inside individual screens.
- If a new feature needs cross-screen route state, extend the router context deliberately and keep feature-local state inside the feature screen.

### Navigation Config

- `src/native/app/navigation/navigationTypes.ts` defines `ScreenKey` and `TabKey`.
- `src/native/app/navigation/navigationLogic.ts` contains pure navigation logic such as route mapping, tab mapping, active tab selection, bottom nav visibility, and return-screen rules.
- `src/native/app/navigation/navigationConfig.ts` contains render config such as bottom nav items and side menu items.
- Navigation config must store translation keys such as `labelKey` and `descriptionKey`; rendering components call `t(...)`.
- When adding, removing, or renaming a route, update the route file, `ScreenKey`, `screenPaths`, tab/side-menu config if needed, and navigation tests.

### Feature Screens

- Main and feature screens live in `src/native/screens`.
- Use clear feature folders and clear file names. Prefer names like `NewsFeedSearchScreen.tsx`, `SmartContractDetailScreen.tsx`, or `CredentialDetailScreen.tsx` over generic names like `SearchScreen.tsx`, `DetailScreen.tsx`, or `SecondaryScreen.tsx`.
- Related subflows stay inside the parent feature folder, for example:
  - `src/native/screens/news-feed/search`
  - `src/native/screens/news-feed/notifications`
  - `src/native/screens/news-feed/smart-contract`
  - `src/native/screens/identity/credential-detail`
  - `src/native/screens/settings/details`
- Shared UI components used across multiple features belong in `src/native/components`.
- Shared styles or helpers used only by a screen family can remain inside that feature folder.
- Feature-specific `README.md` or `FEATURE_RULES.md` files live beside feature code and document scope, important files, business rules, state boundaries, i18n rules, and required tests.
- Keep feature documentation files short and update them when changing feature boundaries or behavior that future contributors must know.

### Feature And Domain Documentation

- `src/native/screens/<feature>/README.md` or `FEATURE_RULES.md` owns screen-level responsibilities, UI flows, state boundaries, and local testing expectations.
- `src/native/domain/<domain>/README.md` or `FEATURE_RULES.md` owns domain-level invariants, pure logic boundaries, and domain testing expectations.
- `docs/adr` owns long-lived architecture decisions.
- `docs/runbooks` owns operational procedures and troubleshooting checklists.
- `CODEOWNERS` maps areas to maintainers once real repository owners or teams exist.

## 6. Current Navigation Product Rules

- Initial authenticated screen is `chat-list`.
- Bottom navigation is icon-only and represents:
  - Chat
  - News Feed
  - Scan QR
  - Payment
  - Identity
- Do not render text labels inside bottom navigation unless a later approved design explicitly reintroduces labels.
- Active bottom nav item uses the primary color for the icon only; do not add a rounded active background unless approved.
- Bottom nav icons are React Native SVG components under `src/native/components/icons/bottom-nav`.
- Bottom navigation visibility is controlled by `navigationLogic.ts`; do not hardcode it in screens.
- `credentials` remains under the Identity tab and keeps bottom navigation visible.
- Settings, Activity, Profile, Security, Notifications, and related secondary screens are reached through side menu or route flows, not as bottom nav tabs.

## 7. State, Store, And Domain Services

- UI reads and writes app state through `src/native/store`.
- `AppStoreProvider.tsx` owns React context, persistence orchestration, and public store actions.
- `appStoreStorage.ts` owns AsyncStorage persistence.
- `appStoreInitialState.ts` owns initial app state.
- Pure state transformations belong in `src/native/domain/app-store/appStoreStateService.ts`.
- Do not bury important state mutation logic inside UI components when it can be expressed as a pure function.
- New important store/domain behavior should have tests.
- Demo data removal must remain supported. Lists backed by demo data must show valid empty states after demo data is removed.

## 8. Data And Demo Data

- Demo data belongs in `src/native/data/demo`.
- Demo data represents replaceable API data. UI should not depend on demo-only assumptions.
- User-generated content, names, messages, post content, and demo conversation/post text may remain as data and do not need to be translated.
- Labels that describe UI state or actions still must go through i18n, even when used near demo data.
- If a feature can show a list, support loading, empty, and no-result states as appropriate.
- For lists that may become long, use `FlatList` or another virtualized list, not `ScrollView`.

## 9. Assets And Icons

- Static image assets must be declared in `src/native/assets/assetManifest.ts`.
- Components, screens, and data modules must import assets from the manifest instead of calling `require(...)` directly.
- Keep asset manifest declarations as static `require(...)` calls so Metro can bundle them.
- The only official app logo is `src/assets/images/identra-logo.png`.
- When showing Identra branding, use `AppLogo` or `AppBrandLogo`; do not rebuild the logo manually or substitute a different mark.
- Verified badges should use the approved verified badge asset from `src/assets/images` through the asset manifest.
- SVG icons used in React Native should be converted to typed React Native components with `react-native-svg`, preserving viewBox, shape, and ratio.

## 10. i18n And Text

- All reusable system UI copy must go through `src/native/i18n` and `useI18n`.
- Do not hardcode Vietnamese or English system UI text in components, navigation config, tabs, buttons, modal copy, empty states, accessibility labels, or reusable UI states.
- Locale files are `src/native/i18n/locales/vi.ts` and `src/native/i18n/locales/en.ts`.
- Keep `en.ts` structurally aligned with `vi.ts`.
- Whenever building or changing a feature, normalize i18n as part of the same change: add or update locale keys for user-facing system UI copy before handoff instead of leaving hardcoded text for later.
- Use typed `I18nKey` whenever a config object stores a translation key.
- User-generated content and demo content that simulates real users does not need translation.
- Save multilingual files as clean UTF-8.
- Before handing off text-heavy changes, scan edited files for mojibake patterns such as `U+00C3`, `U+00C4`, `U+00C6`, UTF-8-decoded-as-Windows-1252 sequences, and the replacement character `U+FFFD`.

## 11. Theme And Styling

- Shared design tokens live in `src/native/theme.ts`.
- Prefer existing tokens for color, spacing, radius, typography, border, motion, touch target, icon size, layout, and shadows.
- Do not move every one-off screen style into `theme.ts`; only shared foundational tokens belong there.
- Screen-specific layout differences can stay in local `StyleSheet.create(...)` files.
- Avoid heavy shadows, heavy borders, and nested cards that make screens feel cramped.
- Keep touch targets at least `44x44px`.
- Content must not be covered by bottom navigation, keyboard, safe areas, or gesture areas.
- Dark mode must preserve the same hierarchy as light mode when the edited area supports dark mode.

## 12. Async Work And Loading

- For async tasks that may take noticeable time, lock relevant interaction and show the shared `LoadingOverlay`.
- Use `LoadingOverlay` for authentication, API calls, signing/sending transactions, QR creation, credential sharing, backup/restore, and other blocking actions.
- Do not create one-off full-screen loading overlays unless there is a clear design requirement.
- Preserve user-entered data on errors and provide a clear retry or safe return path.

## 13. Accessibility And Test IDs

- Every screen or screen-like state must have a stable unique `nativeID` and `testID`.
- Screen IDs use the `screen-` prefix and kebab-case names.
- States that behave as different screens need different screen IDs.
- Do not use screen IDs for ordinary cards, list items, or decorative elements.
- Every icon button must have an `accessibilityLabel`.
- Use `accessibilityRole` and `accessibilityState` where appropriate for buttons, tabs, switches, and selected states.
- Do not communicate state using color alone.
- Content should read in a logical order for screen readers.

## 14. Security And Sensitive Data

- Do not claim that the whole app sandbox is protected merely by an app PIN.
- App PIN protects against casual unauthorized access after the device is unlocked; it is not sufficient against rooted/jailbroken devices, malware, memory scraping, or compromised OS environments.
- Sensitive credentials, keys, tokens, and authentication secrets should use appropriate secure storage or platform security APIs when implemented.
- Secure storage and biometric flows must have Android and iOS fallbacks.
- Do not log secrets, credentials, security codes, private keys, seed phrases, or sensitive identifiers.
- Sensitive values should be masked by default when the screen or user setting requires it.

## 15. Code Quality And Comments

- Prefer existing components, hooks, helpers, and patterns before creating new abstractions.
- Add an abstraction only when it removes real duplication or clarifies a shared contract.
- Keep edits scoped to the requested feature.
- Do not refactor unrelated files just because they are nearby.
- Keep code comments short. Add comments only for hard-to-understand logic, important constraints, platform workarounds, security caveats, or non-obvious business reasons.
- Do not add comments that merely restate the code or turn source files into long-form documentation.
- When changing code logic, update the corresponding documentation in the relevant `README.md`, `FEATURE_RULES.md`, ADR, runbook, or root documentation file.
- Keep file and folder names explicit and feature-oriented.
- Avoid generic catch-all files such as `SecondaryScreens.tsx`, `SearchScreen.tsx`, or `utils.ts` when a clearer domain name exists.

## 16. Linting, Type Checking, And Tests

- ESLint is configured in `eslint.config.js` using Expo flat config and unused import/unused variable rules.
- Keep imports clean. Do not leave unused imports, unused variables, or duplicate imports.
- `npm run lint` should pass before handoff for code changes.
- `npm run typecheck` should pass before handoff for TypeScript changes.
- `npm test` should pass when touching logic covered by tests or when adding important logic.
- Logic tests live in `tests/` and are run through `tsconfig.test.json` plus `node --test`.
- Add tests for pure logic in navigation, store/domain services, search/filtering, payment utilities, i18n, date/status calculations, and any logic with meaningful branching.
- UI-only pixel adjustments may not require tests, but should still be checked manually where practical.

## 17. Git And Worktree Safety

- The worktree may contain user changes.
- Never revert or overwrite user changes unless explicitly requested.
- If a file contains unrelated changes, work with them and keep edits scoped.
- Do not run destructive commands such as hard resets or broad deletes without explicit approval.
- Do not stage, commit, or push unless the user asks.

## 18. Pre-Completion Checklist

- [ ] `codex.md` was read before `design.md`.
- [ ] Relevant feature/domain `README.md` or `FEATURE_RULES.md` files were read when touching documented areas.
- [ ] No fake device UI was implemented.
- [ ] Android and iOS compatibility was preserved.
- [ ] Routes remain thin and screen logic lives under `src/native/screens`.
- [ ] Navigation config and route mappings are updated when routes change.
- [ ] System UI text uses i18n.
- [ ] Static image assets go through `assetManifest.ts`.
- [ ] Demo data remains removable and empty states still work.
- [ ] Long lists use virtualized lists where appropriate.
- [ ] Async blocking tasks use `LoadingOverlay` where appropriate.
- [ ] Every screen-like state has a stable `screen-*` ID.
- [ ] Icon buttons have accessibility labels.
- [ ] Edited UI follows the depth, border, spacing, and hierarchy guidance in `design.md`.
- [ ] Corresponding documentation was updated when code logic changed.
- [ ] `npm run lint`, `npm run typecheck`, and relevant tests pass, or any skipped verification is clearly reported.
- [ ] Text-heavy edited files were scanned for UTF-8/mojibake issues.

## 19. Decision Rule

When it is unclear whether a change belongs to UI, routing, data, domain logic, assets, i18n, or store, do not guess silently. Inspect the existing architecture first. If the answer is still ambiguous or the change would alter product behavior, ask before implementation.
