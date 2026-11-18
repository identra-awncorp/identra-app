# Scan Domain

This folder owns QR payload parsing and safety classification independent of React Native UI.

## Invariants

- Identra references must use a supported purpose and contain both an opaque request ID and a valid expiry.
- Expired Identra references must never be treated as active requests.
- Only HTTP and HTTPS values are classified as web links; all other values remain plain text.
- Wallet requests are recognised strictly and never opened here: `credential-offer` is exactly `openid-credential-offer://?credential_offer_uri=<https URL>`; `presentation-request` is exactly `openid4vp://?client_id=…&request_uri=<https URL>` with optional `request_uri_method=get|post`. Payloads over 2048 characters, mixed-case schemes, by-value offers, duplicate or unknown parameters, fragments, and embedded URLs that are not plain https (no `http`, `javascript:`, credentials in the URL) are `invalid-wallet-request`.
- The parser does not use `URL` for the custom schemes, so Node and Expo's URL polyfill cannot disagree; embedded https URLs are checked with `URL` and the test runs both implementations.
- Parsing must not open URLs, mutate app state, or log raw QR payloads.

Update `tests/qrScan.test.js` when parser behavior changes.
