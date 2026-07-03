# Settings And Activity Screens

This folder owns Settings, Activity, and related secondary account/support screens.

## Scope

- Settings home.
- Activity history.
- Display settings.
- Backup settings.
- Data settings.
- Governance/configuration settings.
- Notification settings.
- Sharing/privacy settings.
- Help and about screens.

## Important Files

- `SettingsHomeScreen.tsx`: settings landing screen.
- `activity/ActivityScreen.tsx`: activity history screen.
- `activity/activityLogLogic.ts`: pure activity grouping/filter logic.
- `details/*`: configurable settings detail screens.
- `components/SettingsLink.tsx`: reusable settings row.
- `settingsStyles.ts`: shared settings screen styles.

## Business Rules

- Settings, Activity, Identity, Credentials, Profile, Security, Notifications, and related secondary screens are reached through side menu or route flows, not bottom navigation tabs.
- The five bottom tabs are Chat, News Feed, Scan QR, Payment, and Mini App.
- The Activity history quick menu must open `screen-activity`.
- Do not recreate the removed `screen-wallet-history-log` screen.
- Settings rows should be predictable, grouped clearly, and avoid heavy nested cards.
- Blocking settings actions such as backup/restore should use the shared loading pattern.

## State Boundaries

- App-level settings live in the app store.
- Pure activity grouping/filter logic belongs in `activity/activityLogLogic.ts` or a future domain service if reused.
- Local UI state such as toggles pending confirmation can stay in the screen until it becomes shared.

## i18n And Content

- Settings labels, descriptions, statuses, empty states, and accessibility labels must use `useI18n`.
- User-entered profile values or external account names are data and do not need translation.

## Tests

When changing activity grouping/filtering behavior, update and run:

- `tests/activityLogLogic.test.js`

When changing route visibility or side-menu behavior, also run:

- `tests/navigationLogic.test.js`
