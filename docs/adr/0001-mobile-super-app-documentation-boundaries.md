# ADR 0001: Mobile Super App Documentation Boundaries

Status: Accepted
Date: 2026-06-29

## Context

Identra is growing from a focused identity wallet into a mobile super app with Chat, News Feed, Payment, QR, Mini App discovery, Identity, Settings, credentials, notifications, live content, and smart contracts.

A single global rule file is not enough for long-term maintainability. New contributors need to understand both the global architecture and the feature-specific business rules before changing code.

## Decision

Use layered documentation:

- `README.md` owns human project onboarding, high-level architecture, and links to deeper docs.
- `codex.md` owns global development rules.
- `design.md` owns global design system rules.
- `src/native/screens/<feature>/README.md` owns screen-level responsibilities, UI flows, state boundaries, and tests.
- `src/native/domain/<domain>/README.md` owns domain-level invariants and pure logic boundaries.
- `docs/adr` records long-lived architecture decisions.
- `docs/runbooks` records operational and troubleshooting procedures.
- `CODEOWNERS` maps areas to owners when real maintainers/teams exist.

Feature and domain README files should stay short, practical, and close to the code they explain.

## Consequences

- Contributors have a clear reading path before editing a feature.
- Business rules are less likely to be hidden only inside UI code.
- Documentation can scale by module instead of turning `codex.md` into a large handbook.
- More files must be kept updated when feature boundaries change.

## Alternatives Considered

- Keep only `codex.md` and `design.md`: rejected because feature-specific logic would become too scattered.
- Put all docs under `docs/`: rejected because feature rules are easier to keep current when they live beside the code.
- Encode all rules as tests only: rejected because tests protect behavior but do not fully explain product intent or ownership.
