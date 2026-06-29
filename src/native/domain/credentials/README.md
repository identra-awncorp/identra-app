# Credentials Domain

This folder is the target home for credential and verifiable credential business logic.

Current credential-related state transformations live in:

- `src/native/domain/app-store/appStoreStateService.ts`

Move credential-specific logic here when it becomes shared across Identity, sharing, QR, activity, settings, or future backend integrations.

## Domain Responsibilities

- Credential status derivation.
- Credential validity and expiry checks.
- Issuer trust metadata.
- Attribute visibility and masking rules.
- Share payload construction.
- Share permission checks.
- Credential list summary counts.
- Demo-data removal semantics for credential lists.
- Verification history normalization.

## Invariants

- Verified, pending, expired, failed, and unavailable states must be semantically distinct.
- Expiry logic must be based on explicit dates and not only display labels.
- Sharing must include exactly the approved attributes, not the whole credential by default.
- Masking rules must be applied before sensitive values reach presentation when required.
- Removing demo data must leave valid empty states.
- Credential detail routes should resolve by stable credential ID.

## Boundaries

- Domain functions should accept plain data and return plain data.
- Domain functions should not import React, React Native, Expo Router, UI components, theme, or i18n hooks.
- UI can translate status labels after domain logic returns semantic status values.
- Store persistence remains in `src/native/store`.
- Security-sensitive storage should be wrapped by a dedicated service before domain/UI consumption.

## Testing

Add or update tests when changing:

- credential upsert/remove semantics
- profile-to-credential attribute synchronization
- expiry/status calculation
- share payload creation
- demo data removal
- credential summary counts

Relevant current test:

- `tests/appStoreStateService.test.js`
