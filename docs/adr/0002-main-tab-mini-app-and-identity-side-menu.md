# ADR 0002: Main Tab Navigation Model

Status: Accepted
Date: 2026-07-04

## Context

Identra needs a first-class Mini App discovery surface in the main mobile navigation. The navigation model also needs one consistent source of truth across the app shell, keep-alive tab host, side menu, route mapping, settings, tests, and documentation.

Identity remains a secure wallet and credential surface, while Mini App is a daily-use discovery and utility hub.

## Decision

The approved five main bottom tabs are:

- Chat
- News Feed
- Scan QR
- Payment
- Mini App

The Mini App tab uses:

- route path `/mini-app`
- `ScreenKey` `mini-app`
- `TabKey` `miniApp`
- keep-alive rendering through `MainTabKeepAliveScreens`
- side-menu settings under the `miniApp` flow settings group

## Consequences

- Route visibility tests must keep bottom navigation limited to Chat, News Feed, Scan QR, Payment, and Mini App.
- Mini App documentation must define catalog, asset, layout, i18n, and future API boundaries because the tab is now a primary product surface.
- Main-tab changes require updating navigation logic, tests, design docs, feature READMEs, and ADRs together.

## Alternatives Considered

- Six bottom tabs: rejected because the current mobile navigation rule is five icon-only tabs.
- Mini App inside Payment or News Feed: rejected because catalog discovery, recommendations, and app-runtime entry points are a distinct product surface.
