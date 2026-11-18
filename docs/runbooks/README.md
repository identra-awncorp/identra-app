# Runbooks

This folder stores operational procedures for development, release checks, incidents, and recurring troubleshooting.

Runbooks should be short, step-by-step, and safe to follow under pressure.

## Current Runbooks

- `mobile-quality-gate.md`: checks before handing off code changes.
- `mobile-incident-triage.md`: first-response checklist for app incidents or severe regressions.
- `wallet-device-verification.md`: what the wallet platform layer still needs a physical device to prove.
- `wallet-screen-review.md`: web screenshots of every wallet screen state for design review.

## Runbook Format

Each runbook should include:

- Purpose.
- When to use it.
- Preconditions.
- Step-by-step procedure.
- Rollback or safe stop criteria.
- Verification.
- Follow-up notes.

Do not put secrets, private endpoints, recovery keys, or production credentials in runbooks.
