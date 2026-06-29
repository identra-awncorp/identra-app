# News Feed Screens

This folder owns the social feed surface and related News Feed flows.

## Scope

- Feed list and feed chrome.
- Compose post.
- News Feed search and filters.
- News Feed notifications.
- Live stream preview and live stream detail.
- Smart contract cards in feed.
- Smart contract detail screens.

## Important Files

- `NewsFeedScreen.tsx`: main feed screen.
- `feed/NewsFeedHeader.tsx`: feed header chrome.
- `feed/NewsFeedTabs.tsx`: feed tabs.
- `feed/NewsFeedListItems.tsx`: feed row/card rendering.
- `feed/newsFeedLayout.ts`: feed chrome layout constants.
- `feed/newsFeedStyles.ts`: feed styles.
- `search/NewsFeedSearchScreen.tsx`: search route screen.
- `search/newsFeedSearchLogic.ts`: pure search/filter helper logic.
- `notifications/NotificationsScreen.tsx`: News Feed notification center.
- `live/LiveStreamScreen.tsx`: immersive live stream viewer.
- `smart-contract/SmartContractDetailScreen.tsx`: contract details by route params.
- `src/native/data/demo/newsFeedDemoData.ts`: replaceable feed demo data.
- `src/native/data/demo/newsFeedSearchDemoData.ts`: replaceable search demo data.
- `src/native/data/demo/newsFeedNotificationDemoData.ts`: replaceable notification demo data.

## Business Rules

- Feed content is virtualized because the list can become long.
- Feed chrome animation must be scroll-linked and continuous.
- Tabs remain reachable and must not hide behind device status UI.
- FAB animation should not cover primary content.
- Standard feed rows use avatar column plus content body; text and media belong to the content body.
- Verified badges use the approved badge asset.
- Feed media uses approved assets through the asset manifest.
- Live stream cards must stay compact inside the feed.
- Smart contract cards must reflect their actual state, including available and sold-out states.
- Smart contract details use route params, not global mutable selected-state.

## State Boundaries

- Feed chrome animation state is shared through router context because the shell reacts to it.
- Search filters and interest chips are local to the search screen unless product behavior requires persistence.
- Contract detail identity comes from route params.
- Reusable pure filter/search logic belongs in `search/newsFeedSearchLogic.ts` or a future domain service.

## i18n And Content

- Tabs, filter labels, buttons, empty states, notification categories, accessibility labels, and system status copy must use `useI18n`.
- Post body text, account names, handles, comments, and demo social content are content data and do not need translation.

## Tests

When changing search or filter behavior, update and run:

- `tests/newsFeedSearchLogic.test.js`

When changing route/tab behavior, also run:

- `tests/navigationLogic.test.js`
