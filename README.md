# Identra Mobile

Identra là ứng dụng ví danh tính số được xây dựng bằng React Native và Expo SDK 56, hỗ trợ Android và iOS.

## Chạy dự án

Yêu cầu: Node.js và ứng dụng Expo Go tương thích SDK 56, hoặc Android Studio/Xcode để chạy simulator.

```bash
npm install
npm start
```

Các lệnh thường dùng:

```bash
npm run android
npm run ios
npm run web
npm run typecheck
```

## Kiến trúc

- `app/`: entry và layout của Expo Router
- `src/native/`: toàn bộ mã React Native, store và màn hình
- `src/native/store.tsx`: persistence dữ liệu ứng dụng bằng AsyncStorage
- `design.md`, `codex.md`: quy tắc thiết kế và triển khai bắt buộc

Mọi màn hình đều có `nativeID` và `testID` ổn định với tiền tố `screen-`. Ứng dụng sử dụng safe area thật của thiết bị và không dựng status bar hay home indicator giả.
