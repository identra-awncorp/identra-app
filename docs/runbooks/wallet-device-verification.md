# Wallet Device Verification

## Purpose

The wallet platform layer is proven in Node (adapters against faithful fakes, SQL run by
`node:sqlite`), by `npx expo export` for Android and iOS, and by running the SDK on a Hermes VM.
None of that touches a real Keychain, Keystore, SQLite file, biometric prompt or OS backup. Run
this checklist on physical devices before relying on the wallet.

## Preconditions

- Development build (`npx expo run:android` / `run:ios`, or EAS), not Expo Go.
- One Android phone (API 31+, and one API ≤ 30 if available) and one iPhone, each with biometrics enrolled.
- A test hook or debug screen that calls `getWallet(...)` (the issuance screens come later).

## Procedure

1. Start-up: the app opens normally (no "device not supported" screen). With the debugger, `checkWalletRuntime()` returns `{ ok: true }`.
2. Randomness: two `wallet.random.bytes(32)` calls differ, in a development AND a release build.
3. Wallet key: `keyStore.create()` prompts for biometrics on Android (not on iOS); `keyStore.signer(id)` prompts on both.
4. Cancel the prompt: the call rejects with `SecretStorageError` code `CANCELLED`, never `KEY_NOT_FOUND`.
5. Biometric change: add a fingerprint / reset Face ID, then `signer(id)` → `KEY_INVALIDATED`; reading the data key and opening the vault still work.
6. Locked device (iOS): from a background task while locked, a data-key read rejects with `LOCKED`.
7. Vault: save, list, open, setStatus, removeWithKey; kill and restart the app; rows and catalogue survive.
8. Files: the database is at `files/SQLite/identra-wallet.db` (Android) / `Documents/SQLite/identra-wallet.db` (iOS); the catalogue at `files/identra-backup-catalogue.json` / `Documents/identra-backup-catalogue.json` and contains only `vct` and `issuer`.
9. Android backup: `adb shell bmgr backupnow com.identra.app`, uninstall, reinstall with restore (or `adb shell bmgr restore`). Expect: catalogue back; database, SecureStore prefs absent; `getStartupState()` → `ready` with `toRequest` listing the documents.
10. iOS backup: back up, restore to a second iPhone. Expect (known gap): database back, data key not; `getStartupState()` → `restored-device`; after `acknowledgeNewDevice()` the vault is empty and the catalogue lists the documents.
11. HTTP: against a test server, a redirect is refused (`REDIRECT`), a >256 KB body is refused (`TOO_LARGE`), a stalled response times out (`TIMEOUT`), no cookie is sent or stored, and a development build with `EXPO_PUBLIC_IDENTRA_API_URL` reaches the mapped origin.
12. QR: scanning `openid-credential-offer://?credential_offer_uri=https://…` opens the receive screen and `openid4vp://?client_id=…&request_uri=https://…` opens the sharing screen; an old `identra://credential-presentation` code says that way of sharing is no longer used.
13. Android build: `./gradlew :app:lintRelease` shows no `FullBackupContent` errors and the merged manifest keeps `@xml/identra_backup_rules` / `@xml/identra_data_extraction_rules`.

## Safe Stop

Stop and report if any step returns `null` where a rejection is expected, or if the database or
SecureStore prefs appear in an Android restore.

## Verification

Record the device models, OS versions and the result of each step in the hand-off.

## Receive and keep (added with the receive screens)

14. Scan the sample university's QR code from `https://identra.awncorp.vn/vi/school-portal`: the receive screen names "Trường Mẫu" and "Bằng tốt nghiệp"; the PIN field opens the numeric keypad, accepts a pasted 6-digit PIN, and the boxes advance.
15. Before the system prompt, the one-line explanation is visible; then the biometric prompt appears (Android and iOS). Cancel it: the screen stays on the PIN step with "Bạn đã hủy…", nothing is saved.
16. Wrong PIN once: the boxes turn red and empty, the sentence asks to re-enter; the right PIN then succeeds. Five wrong PINs: "Mã này đã hết hạn…" and the issuer page button opens the portal.
17. Airplane mode at the PIN step: "Không kết nối được với nơi cấp…", retry works once online.
18. Success: "Xem giấy tờ" opens the detail after the access gate; the seven fields show with Vietnamese labels; "Hiện"/"Ẩn" masks date of birth, student id and diploma number.
19. "Kiểm tra lại" online → "Đã xác minh"; offline → the inline "Không kết nối được…" and the last known status stays. After the school revokes it (portal) and 15 minutes pass → "Đã bị thu hồi".
20. "Xóa khỏi ví" → confirmation names the document and issuer → the list is empty, the empty state offers "Quét mã QR".
21. Restored phone (iOS backup to a second iPhone): the list shows the restore card; the restore screen lists the documents, "Mở trang của nơi cấp" opens the portal, confirming clears the old rows.
22. Settings → Sao lưu shows what is and is not backed up and opens the same restore list.
23. Dark mode and English: repeat 14 and 18 with the system in dark mode and the app in English.
24. TalkBack / VoiceOver: list rows read "document, issuer, status"; the PIN field is announced with its label.

## Sharing (added with the consent screen)

25. On the website's employer demo, scan the verifier QR: the consent screen names "Nhà Tuyển Dụng Mẫu", shows "Đã được Identra xác nhận", the purpose and a countdown; values are dots until "Hiện".
26. "Chia sẻ ít hơn" drops Hạng/Năm tốt nghiệp; "Không chia sẻ" lists Ngày sinh, Mã sinh viên, Số hiệu bằng. Share: the one-line explanation, then the biometric prompt; the website then shows exactly Họ và tên + Ngành.
27. Cancel the biometric prompt: back on the consent screen with "Bạn đã hủy…", the website still waits; share again works (or, once the SDK makes requests single-use, the screen asks to scan again).
28. Double-tap "Chia sẻ" quickly: one prompt, one result on the website.
29. Wait out the countdown: "Yêu cầu đã hết hạn…", Chia sẻ is gone; scan again.
30. Press back or switch apps on the consent screen: the app-switcher thumbnail shows the privacy cover, not values; going back declines (the website keeps waiting, nothing posted).
31. Airplane mode just before "Chia sẻ": the failure says the information may or may not have arrived and to check their screen; nothing is resent automatically.
32. A verifier missing from the trust list (staging): red warning, "Từ chối" is the primary action, "Vẫn chia sẻ" needs the second confirmation.
33. After a biometric re-enrolment (Android): sharing ends with "Khóa bảo vệ giấy tờ này không còn dùng được…" and the portal button.
34. Detail screen: "Lần chia sẻ gần đây" lists the employer, the field names and the date; no values.
