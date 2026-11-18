# Wallet Screen Review (web screenshots)

## Purpose

Render every wallet screen state without a device for design review. Web (react-native-web in
headless Chromium) approximates native rendering: fonts, keyboard, safe areas, alerts and the
biometric prompt differ on a phone. Use `wallet-device-verification.md` for the real thing.

## Procedure

1. Build the web export with the scripted harness wallet (never in a normal build):
   `EXPO_PUBLIC_WALLET_HARNESS=1 npx expo export --platform web --output-dir /tmp/identra-app-web-harness`
2. Capture (Playwright's `playwright-core`, port 47342 on 127.0.0.1, stopped at the end):
   `PLAYWRIGHT_CORE=$(npm root -g)/@playwright/cli/node_modules/playwright-core node scripts/capture-wallet-screens.cjs /tmp/identra-app-web-harness .review/wallet`
3. Review `.review/wallet/*.png` (git-ignored): every state at 390×844 and 360×740, plus dark and
   English for the main states.

## Harness scenarios

`src/native/dev/walletHarness.ts`: `held`, `empty`, `restored`, `catalogue`, `broken`; PIN
`000000` wrong, `111111` credential fails its checks, `222222` expired, `333333` offline.

## Verification

A production `npx expo export` must not contain the harness: `grep -c identra.harness` on the
bundle is 0.
