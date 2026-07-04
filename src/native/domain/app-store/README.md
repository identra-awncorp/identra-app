# App Store Domain

This folder owns pure app-state transformations that are shared by the React store and feature screens.

## Domain Responsibilities

- Credential upsert and replacement by stable ID.
- Activity log creation, insertion, update, removal, read-state handling, and new-highlight clearing.
- Pending activity expiry based on explicit deadlines.
- Profile updates that synchronize profile-backed credential attributes.
- App settings normalization and flow-settings defaults.
- Demo-data removal for credentials and activity logs.

## Important Files

- `appStoreStateService.ts`: pure transformations for persisted credentials, logs, profile, settings, and demo-data removal.
- `appSettingsDefaults.ts`: default flow settings and normalization for language, theme, global settings, and per-flow settings.
- `src/native/store/AppStoreProvider.tsx`: React provider that consumes this domain logic.
- `src/native/store/appStoreInitialState.ts`: initial persisted app state.
- `src/native/store/appStoreStorage.ts`: AsyncStorage persistence boundary.

## Invariants

- Domain functions must accept plain state/data and return plain state/data.
- Domain functions should not mutate the input state.
- Credential upsert must replace duplicate IDs and keep the newest credential first.
- Activity log IDs must remain stable once created.
- Expired pending logs must become failed, unread, and highlighted.
- Settings must always pass through normalization before being stored.
- Global `hideSensitiveData` must stay synchronized with the identity flow setting.
- Demo-data removal must not remove real user data.

## Boundaries

- This folder should not import React, React Native components, Expo Router, UI theme, or i18n hooks.
- Storage belongs in `src/native/store/appStoreStorage.ts`, not this domain folder.
- UI-specific labels and translated strings belong in screens or i18n, not domain functions.
- Feature-specific domain logic should move to a dedicated feature domain when it grows beyond shared app-state transformation.

## Testing

When changing app-state transformations, update and run:

- `tests/appStoreStateService.test.js`

When changing settings defaults or route visibility assumptions, also run:

- `tests/navigationLogic.test.js`
- `tests/i18n.test.js`
