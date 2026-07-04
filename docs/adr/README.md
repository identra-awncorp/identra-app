# Architecture Decision Records

This folder stores Architecture Decision Records (ADRs) for important technical and product-architecture decisions.

Use ADRs for decisions that affect more than one feature, shape future work, or are expensive to reverse.

## Naming

Use this format:

```text
NNNN-short-kebab-case-title.md
```

Examples:

- `0001-mobile-super-app-module-boundaries.md`
- `0002-route-params-for-detail-screens.md`

## Status Values

- `Proposed`: under discussion.
- `Accepted`: approved and should be followed.
- `Superseded`: replaced by a newer ADR.
- `Deprecated`: kept for history and avoided for new decisions.

## Template

```markdown
# ADR NNNN: Title

Status: Proposed
Date: YYYY-MM-DD

## Context

What problem or pressure caused this decision?

## Decision

What are we deciding?

## Consequences

What becomes easier, harder, or constrained?

## Alternatives Considered

What did we reject and why?
```
