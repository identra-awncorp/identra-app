# Identity Screens

This folder owns identity, wallet, credential, profile, security, and credential-sharing surfaces.

## Scope

- Identity wallet home.
- Credential list.
- Credential detail.
- Credential sharing and QR sharing flows.
- Profile.
- Security settings entry points.

## Important Files

- `WalletScreen.tsx`: Identity wallet landing screen.
- `credentials/CredentialsScreen.tsx`: credential list.
- `credential-detail/CredentialDetailScreen.tsx`: credential details by route params.
- `share/CredentialSharingScreens.tsx`: sharing and QR-related screens.
- `profile/ProfileScreen.tsx`: profile view/edit surface.
- `security/SecurityScreen.tsx`: security surface.
- `src/native/data/demo/identityDemoData.ts`: replaceable identity demo data.
- `src/native/domain/app-store/appStoreStateService.ts`: current credential/profile state transformations.

## Business Rules

- Identity screens must make verification state explicit with text and icon, not color alone.
- Credential status must clearly distinguish verified, pending, expired, failed, and unavailable states.
- Credential details should show status, hero credential metadata, issuer, attributes, and actions.
- Sharing flows must make it obvious which data will be shared and with whom.
- Demo credential data must be removable without breaking empty states.
- Sensitive data should be masked where required by product settings.

## State Boundaries

- Persisted credentials, activity logs, profile, and settings live in the app store.
- Pure credential/profile transformations currently live in `src/native/domain/app-store/appStoreStateService.ts`.
- Credential-specific domain logic should move toward `src/native/domain/credentials` as it grows.
- Detail screens should use route params such as `credentialId`.

## i18n And Content

- System labels, actions, statuses, empty states, warning copy, and accessibility labels must use `useI18n`.
- Credential attribute values, issuer names, and user profile values are data and do not need translation unless they are system-generated labels.

## Tests

When changing persisted credential/profile behavior, update and run:

- `tests/appStoreStateService.test.js`

When changing route behavior, also run:

- `tests/navigationLogic.test.js`
