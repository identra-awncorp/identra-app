# Mini App Screens

This folder owns the Mini App discovery surface and related catalog entry points.

## Scope

- Mini App primary screen.
- Frequently used mini app shortcuts.
- Hero discovery banner.
- Popular category shortcuts.
- Recommended mini app list.
- Featured collection banners.
- Mini App search and notification entry points while the real catalog API is not connected.

Mini App owns discovery and catalog browsing. The actual native or web mini app runtime is a future integration and should not be implemented inside this folder without a separate architecture decision.

## Important Files

- `MiniAppScreen.tsx`: Mini App landing screen and section composition.
- `index.ts`: public screen export.
- `src/native/data/demo/miniAppDemoData.ts`: replaceable catalog, recommendation, category, and collection demo data.
- `src/native/assets/assetManifest.ts`: Mini App banner and icon manifest.
- `src/assets/images/mini-app-demo/optimized`: optimized Mini App screen assets used by the manifest.
- `src/native/app/navigation/navigationLogic.ts`: route, tab, active-tab, and bottom-nav visibility mapping.
- `src/native/app/navigation/navigationConfig.ts`: bottom navigation item config.
- `src/native/app/router/MainTabKeepAliveScreens.tsx`: keep-alive host for the Mini App main tab.
- `src/native/app/navigation/sideMenuSettingsConfig.ts`: Mini App side-menu settings.

## Routes And Navigation

- `/mini-app` is the Mini App main-tab route.
- `TabKey` is `miniApp`.
- `ScreenKey` is `mini-app`.
- Mini App is one of the five main bottom tabs: Chat, News Feed, Scan QR, Payment, and Mini App.
- `app/mini-app.tsx` stays thin because the keep-alive tab host renders `MiniAppScreen`.
- Search and notifications can stay as placeholders while the real Mini App catalog, search, and notification APIs are not connected.

## Layout Contract

- Use the same shell, header rhythm, side padding, text scale, and button sizing family as Payment Home.
- Content must respect `ScreenScroll` spacing and real safe areas.
- Section order is:
  1. Frequently used
  2. Hero banner
  3. Popular categories
  4. Recommended for you
  5. Featured collections
- Frequently used and popular category tiles must use shared card dimensions and icon dimensions.
- Recommended rows should stay scan-friendly and avoid extra primary buttons unless the action is implemented.
- Collection banners must render from the image aspect ratio instead of fixed height.
- Do not introduce nested cards inside repeated tile/card content.

## Asset Contract

- Screens and demo data must import images from `assetManifest`, not local `require(...)` calls.
- Optimized hero and collection banners keep the source design ratio `1635 / 962`; current optimized files are `1080x635` JPGs.
- Mini App icons are normalized to a `160x160` transparent PNG canvas and rendered at a fixed UI size.
- New catalog artwork must be resized/compressed to the displayed size class before being added to the manifest.
- Keep original design assets only as source inputs; app UI should point at optimized assets.

## Business Rules

- Catalog content currently uses replaceable demo data and must tolerate empty or missing API data later.
- Shortcuts, categories, recommendations, and collections must have stable IDs for tracking and future API reconciliation.
- A real "open mini app" action must distinguish between native screen, webview/runtime, external link, and unavailable state.
- Unavailable demo actions should show a clear coming-soon state instead of implying a real integration.
- Search should eventually query catalog name, category, provider, and description.
- Notifications should eventually distinguish platform notifications from individual mini app updates.

## State Boundaries

- Screen-local display state belongs in `MiniAppScreen.tsx`.
- Route, tab, mounted-state, and return-screen behavior belongs in the app router/navigation layer.
- App-level Mini App preferences live in the app store under `flowSettings.miniApp`.
- Catalog, recommendation, eligibility, installed/pinned state, and open-action resolution should move into a future Mini App domain service when API integration begins.
- Demo data belongs in `src/native/data/demo` and should remain easy to replace with API responses.

## i18n And Content

- Section titles, actions, placeholders, accessibility labels, and coming-soon copy must use `useI18n`.
- Provider names, app names, and catalog descriptions are product data and may come from API/localized catalog content later.
- Keep Vietnamese and English locale keys in sync whenever Mini App copy changes.

## Tests

When changing Mini App tab, route, bottom-nav, side-menu, or keep-alive behavior, update and run:

- `tests/navigationLogic.test.js`

When changing locale keys, also run:

- `npm test`

Also run:

- `npm run lint`
- `npm run typecheck`
