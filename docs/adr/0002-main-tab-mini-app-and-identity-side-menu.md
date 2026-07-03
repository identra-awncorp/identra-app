# ADR 0002: Mini App Main Tab And Identity Side Menu

Status: Accepted
Date: 2026-07-04

## Context

Identra now needs a first-class Mini App discovery surface in the main mobile navigation. The previous five-tab model treated Identity as a main tab, but the product direction now positions Identity as a secure wallet/control surface opened when needed, while Mini App becomes a daily-use discovery and utility hub.

The app shell, keep-alive tab host, side menu, route mapping, settings, tests, and documentation all need one consistent source of truth for this navigation model.

## Decision

The approved five main bottom tabs are:

- Chat
- News Feed
- Scan QR
- Payment
- Mini App

Identity is no longer a main bottom tab. Identity wallet, Credentials, Profile, Security, Sharing, and related identity flows are reached through the side menu or direct routes.

The Mini App tab uses:

- route path `/mini-app`
- `ScreenKey` `mini-app`
- `TabKey` `miniApp`
- keep-alive rendering through `MainTabKeepAliveScreens`
- side-menu settings under the `miniApp` flow settings group

## Consequences

- Bottom navigation and active-tab logic must not include Identity.
- Identity documentation and screen code should describe Identity as side-menu/direct-route entry, not tab entry.
- Route visibility tests must keep bottom navigation limited to Chat, News Feed, Scan QR, Payment, and Mini App.
- Mini App documentation must define catalog, asset, layout, i18n, and future API boundaries because the tab is now a primary product surface.
- Any future replacement of a main tab requires updating navigation logic, tests, design docs, feature READMEs, and ADRs together.

## Alternatives Considered

- Keep Identity as a main tab and expose Mini App only from side menu: rejected because Mini App is intended as a high-frequency discovery surface.
- Add Mini App as a sixth bottom tab: rejected because the current mobile navigation rule is five icon-only tabs.
- Merge Mini App into Payment or News Feed: rejected because catalog discovery, recommendations, and app-runtime entry points are a distinct product surface.
