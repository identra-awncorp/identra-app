# Identra Mobile

Identra Mobile là ứng dụng siêu ứng dụng danh tính số được xây dựng bằng Expo, React Native và Expo Router. Ứng dụng hiện ưu tiên trải nghiệm mobile thật, hỗ trợ Android và iOS, không dựng giả status bar, notch, home indicator hay navigation bar của hệ điều hành.

## Yêu cầu

- Node.js tương thích với Expo SDK 56.
- Expo Go tương thích SDK 56, hoặc Android Studio/Xcode để chạy emulator/simulator.
- Chạy `npm install` trước khi khởi động dự án lần đầu.

## Chạy dự án

```bash
npm start
npm run android
npm run ios
npm run web
```

Các lệnh kiểm tra chất lượng:

```bash
npm run lint
npm run typecheck
npm test
```

## Kiến trúc hiện tại

### Route Layer

- `app/`: route entries của Expo Router. Các file trong thư mục này nên mỏng, chỉ nối URL route tới màn hình thật trong `src/native/screens`.
- `app/_layout.tsx`: gắn provider cấp app và shell chung.
- `app/credentials/[credentialId].tsx`: route chi tiết thực chứng theo route params.
- `app/smart-contracts/[postId].tsx`: route chi tiết hợp đồng thông minh theo route params.

### App Shell Và Navigation

- `src/native/app/router/AppShell.tsx`: shell chung của ứng dụng, chịu trách nhiệm auth redirect, app frame, side menu, bottom navigation và chrome dùng chung.
- `src/native/app/router/AppRouterContext.tsx`: trạng thái router/UI chrome dùng chung, ví dụ side menu và animation chrome của News Feed.
- `src/native/app/navigation/navigationTypes.ts`: định nghĩa `ScreenKey` và `TabKey`.
- `src/native/app/navigation/navigationLogic.ts`: logic thuần cho map route, tab, screen, bottom nav visibility và return screen.
- `src/native/app/navigation/navigationConfig.ts`: config hiển thị cho bottom navigation và side menu. Text trong config dùng translation key, không hardcode UI copy.

Bottom navigation hiện là 5 tab icon-only: Chat, News Feed, Scan QR, Payment và Identity. Các màn hình phụ như Settings, Activity, Credentials, Profile đi qua side menu hoặc route riêng.

### Store Và Domain

- `src/native/store/AppStoreProvider.tsx`: React provider và hook `useAppStore`.
- `src/native/store/appStoreInitialState.ts`: trạng thái khởi tạo của app.
- `src/native/store/appStoreStorage.ts`: persistence qua AsyncStorage.
- `src/native/store/index.ts`: public exports của store.
- `src/native/domain/app-store/appStoreStateService.ts`: logic thuần để cập nhật app state như credential, activity log, profile, settings và loại bỏ demo data.

Quy ước: UI gọi store/provider; các phép biến đổi dữ liệu quan trọng nên được đưa về domain service để dễ test và tránh nhồi logic vào component.

### Screens

- `src/native/screens/auth`: onboarding, đăng nhập, đăng ký, OTP.
- `src/native/screens/chat-list`: màn hình chính Chat List, quick contacts, reels/thought viewer và logic tìm kiếm chat.
- `src/native/screens/chat`: luồng hội thoại và các action sheet liên quan thanh toán/hợp đồng.
- `src/native/screens/news-feed`: feed, compose post, search, notifications, live stream và smart contract detail.
- `src/native/screens/identity`: ví danh tính, thực chứng, chi tiết thực chứng, hồ sơ, bảo mật, chia sẻ QR.
- `src/native/screens/payment`: màn hình Payment/IDPay.
- `src/native/screens/scan`: QR scanner.
- `src/native/screens/settings`: cài đặt, hoạt động, backup, hiển thị, dữ liệu, hỗ trợ và thông tin ứng dụng.
- `src/native/screens/shared`: style hoặc helper dùng chung giữa các màn hình phụ.

Khi thêm màn hình mới, đặt tên file rõ theo feature, ví dụ `NewsFeedSearchScreen.tsx` thay vì `SearchScreen.tsx`.

### Feature Và Domain Documentation

- `src/native/screens/auth/README.md`: quy tắc Onboarding, Login, Register và OTP.
- `src/native/screens/chat-list/README.md`: quy tắc màn hình Chat List và conversation preview.
- `src/native/screens/chat/README.md`: quy tắc màn hình hội thoại và chat action sheets.
- `src/native/screens/news-feed/README.md`: quy tắc News Feed, Search, Notifications, Live và Smart Contract.
- `src/native/screens/identity/README.md`: quy tắc Identity, Credentials, Profile, Security và Sharing.
- `src/native/screens/payment/README.md`: quy tắc Payment/IDPay.
- `src/native/domain/chat/README.md`: invariants và boundary cho chat logic.
- `src/native/domain/payment/README.md`: invariants và boundary cho payment logic.
- `src/native/domain/credentials/README.md`: invariants và boundary cho credential logic.
- `docs/adr`: Architecture Decision Records cho quyết định kiến trúc dài hạn.
- `docs/runbooks`: checklist vận hành, release, incident và troubleshooting.
- `CODEOWNERS`: template mapping owner khi repo có nhiều người cùng phát triển.

Khi sửa một feature/domain đã có README, đọc file README đó cùng với `codex.md` và `design.md` trước khi code.

### Shared Components, Theme Và Assets

- `src/native/components`: component dùng chung giữa nhiều màn hình.
- `src/native/components/icons/bottom-nav`: icon bottom navigation đã convert sang React Native component bằng `react-native-svg`.
- `src/native/components/LoadingOverlay.tsx`: overlay chung cho tác vụ bất đồng bộ có thể mất thời gian.
- `src/native/theme.ts`: design tokens dùng chung như màu sắc, typography, spacing, radius, border, shadow và layout.
- `src/native/assets/assetManifest.ts`: manifest asset tĩnh. Component, screen và demo data phải import ảnh từ manifest thay vì rải `require(...)` trực tiếp.
- `src/assets/images/identra-logo.png`: logo chính thức của Identra, dùng qua `AppLogo` hoặc `AppBrandLogo`.

### Data Và i18n

- `src/native/data/demo`: demo data có thể thay thế bằng API thật. Demo data phải có thể xóa bỏ mà UI vẫn hiển thị empty state hợp lệ.
- `src/native/i18n`: provider, hook `useI18n` và locale `vi`/`en`.

Quy ước i18n: toàn bộ system UI như tab, button, modal, empty state, accessibility label và navigation copy phải đi qua i18n. Tên người dùng, tin nhắn, nội dung bài viết và dữ liệu demo mô phỏng nội dung người dùng không bắt buộc chuyển ngôn ngữ.

### Tests Và Lint

- `tests/`: test Node cho logic thuần, ví dụ navigation, app store state service, i18n, chat search, news feed search và payment utils.
- `tsconfig.test.json`: build test TypeScript sang JavaScript để chạy bằng `node --test`.
- `eslint.config.js`: ESLint flat config của Expo, bật rule chặn unused imports/unused vars và duplicate imports.

## Quy Tắc Phát Triển

- Trước khi code UI hoặc chỉnh flow, đọc lại `design.md` và `codex.md`.
- Mỗi screen/view phải có `nativeID` và `testID` ổn định, dùng tiền tố `screen-` cho screen.
- Không dựng giả UI của thiết bị như giờ, pin, Wi-Fi, Dynamic Island, home indicator hoặc navigation bar.
- Luôn tôn trọng safe area thật qua `react-native-safe-area-context`.
- UI phải hoạt động tốt trên cả Android và iOS; API thiết bị nên dùng Expo module tương thích hai nền tảng.
- Card, border và shadow phải tinh tế, không làm giao diện bị chia khối nặng hơn thiết kế.
- Danh sách có thể dài nên dùng `FlatList` thay vì `ScrollView`.
- Các tác vụ async quan trọng phải khóa tương tác phù hợp và dùng `LoadingOverlay`.

## Quy Trình Khi Thêm Feature

1. Tạo route mỏng trong `app/` nếu feature cần URL/screen riêng.
2. Đặt screen thật vào `src/native/screens/<feature>` hoặc thư mục con rõ nghĩa.
3. Tạo hoặc cập nhật README cho feature nếu có rule/flow quan trọng cần người sau nắm được.
4. Đưa data demo vào `src/native/data/demo` nếu chưa có API thật.
5. Đưa asset tĩnh vào `assetManifest.ts`.
6. Đưa system UI copy vào `src/native/i18n/locales/vi.ts` và `src/native/i18n/locales/en.ts`.
7. Đưa logic thuần vào domain service hoặc file logic riêng khi có thể test.
8. Bổ sung test cho logic quan trọng rồi chạy `npm run lint`, `npm run typecheck`, `npm test`.
