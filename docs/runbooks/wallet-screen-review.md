# Wallet Screen Review (web screenshots)

## Purpose

Render every wallet screen state without a device for design review. Web (react-native-web in
headless Chromium) approximates native rendering: fonts, keyboard, safe areas, alerts and the
biometric prompt differ on a phone. Use `wallet-device-verification.md` for the real thing.

## Procedure

1. Build a DEVELOPMENT web export with the scripted harness wallet (the alias `identra-wallet-harness`
   resolves to it only with the variable set, it is refused outside `__DEV__`, and harness builds use
   their own Metro cache directory):
   `EXPO_PUBLIC_WALLET_HARNESS=1 npx expo export --platform web --dev --clear --output-dir /tmp/identra-app-web-harness`
2. Capture (Playwright's `playwright-core`, port 47342 on 127.0.0.1, stopped at the end):
   `PLAYWRIGHT_CORE=$(npm root -g)/@playwright/cli/node_modules/playwright-core node scripts/capture-wallet-screens.cjs /tmp/identra-app-web-harness .review/wallet`
3. Review `.review/wallet/*.png` (git-ignored): every state at 390×844 and 360×740, plus dark and
   English for the main states.

## Harness scenarios

`src/native/dev/walletHarness.ts`: `held`, `empty`, `restored`, `catalogue`, `broken`, `did` (an X.509
document beside five of the DID trust path: valid with the gateway's usual 16-character identifier, not
checked yet, issuer no longer recognised, not checked because the build has no CertNet configuration,
valid with a 64-character identifier that has no place to break a line;
"Kiểm tra lại" answers with that state's checks); an offer QR containing `did` comes from a DID
issuer (`longdid`: the 64-character identifier) (containing `unsupported`: refused, this build has no CertNet), where PIN `666666` gives an issuer CertNet could not resolve (resumes without the PIN); PIN
`000000` wrong, `111111` credential fails its checks, `222222` expired, `333333` no answer to the PIN
(code not redeemed: PIN step again), `444444` cancelled prompt and `555555` offline after the PIN
(both resume without the PIN).
Sharing: `identra.harness.presentation` QR containing `untrusted`, `two-docs`, `did-doc`, `long-did`, `mixed-docs` (scenario `did`), `revoked`,
`invalid-doc`, `three-sets`, `nomatch`, `short`, or a refusal code; `identra.harness.submit` = `ok` or a wallet code, or a
comma list answering the sends of one request in turn (`DID_RESOLUTION_UNAVAILABLE,ok`: received but not checked, then
sent again; like the SDK the third send after `DID_RESOLUTION_UNAVAILABLE` is `VERIFIER_ERROR`). `CAPTURE_ONLY` takes
comma-separated name prefixes. The `present-delivered-history*` states reach the activity list and the document through
the app's own navigation (a reload starts a new store). `CAPTURE_ONLY=present`
limits the capture to the sharing states. Long screens also get a `-bottom.png`.

## Verification

`npm run check:bundle` (a `--clear` android + ios export) must pass before any hand-off: it fails if
any module of `src/native/dev/**` or any of its strings is in the bundle.
