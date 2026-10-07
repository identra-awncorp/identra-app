# Scan Domain

This folder owns QR payload parsing and safety classification independent of React Native UI.

## Invariants

- Identra references must use a supported purpose and contain both an opaque request ID and a valid expiry.
- Expired Identra references must never be treated as active requests.
- Only HTTP and HTTPS values are classified as web links; all other values remain plain text.
- Parsing must not open URLs, mutate app state, or log raw QR payloads.

Update `tests/qrScan.test.js` when parser behavior changes.
