# Quy tắc phát triển giao diện Identra

Các quy tắc trong tài liệu này phải được áp dụng khi thiết kế, chỉnh sửa hoặc đối chiếu giao diện của dự án.

## 1. Phân biệt UI ứng dụng và UI thiết bị

- Ảnh tham chiếu có thể chứa cả giao diện ứng dụng và giao diện do hệ điều hành hoặc thiết bị hiển thị.
- Chỉ triển khai các thành phần thuộc giao diện ứng dụng.
- Không triển khai status bar giả, bao gồm:
  - Giờ hệ thống
  - Trạng thái pin
  - Trạng thái Wi-Fi hoặc mạng di động
  - Dynamic Island, tai thỏ hoặc camera cutout
- Không triển khai home indicator, thanh điều hướng hệ thống hoặc nút điều hướng Android giả.
- Không thêm khung điện thoại, viền thiết bị hoặc camera vào ứng dụng.
- Chỉ mô phỏng các thành phần trên khi người dùng yêu cầu rõ ràng tạo device mockup hoặc bản trình diễn trong khung điện thoại.

## 2. Khi đối chiếu với ảnh thiết kế

- Trước khi chỉnh code, phân loại từng thành phần trong ảnh thành:
  1. UI thuộc ứng dụng
  2. UI thuộc hệ điều hành hoặc thiết bị
  3. Nội dung trang trí chỉ dành cho mockup
- Bám sát bố cục, màu sắc, typography, spacing, radius, shadow và icon của phần UI ứng dụng.
- Không sao chép máy móc toàn bộ ảnh tham chiếu.
- Giữ nguyên chức năng và luồng tương tác hiện có, trừ khi yêu cầu nói rõ cần thay đổi.

## 3. Quy tắc cho ứng dụng Expo React Native

- Dự án sử dụng Expo và React Native; không triển khai màn hình bằng HTML, DOM hoặc CSS.
- Hệ điều hành chịu trách nhiệm hiển thị status bar và vùng điều hướng hệ thống.
- Giao diện phải bắt đầu từ app bar hoặc nội dung đầu tiên của ứng dụng.
- Tôn trọng safe area bằng `SafeAreaView` và `useSafeAreaInsets`, không vẽ lại UI hệ thống.
- Bottom navigation của ứng dụng được phép hiển thị, nhưng không được chứa home indicator giả.
- Bottom navigation phải hiển thị icon và text label bên dưới giống hệt ảnh thiết kế đã được phê duyệt.
- Mục active của bottom navigation dùng màu primary cho cả icon và text; không tự ý thêm nền bo tròn hoặc pill nếu thiết kế không có.
- Khi ảnh thiết kế bottom navigation thay đổi, phải ưu tiên bám đúng icon, label, màu sắc, spacing, border và chiều cao trong ảnh mới nhất.
- Bottom navigation phải tiếp tục hiển thị trên màn hình `screen-credentials-library`.
- Shadow, elevation và border của card phải bám đúng ảnh thiết kế mới nhất; không tự động dùng shadow chung nếu làm giao diện đậm hơn ảnh.
- Trên màn hình chính, card chỉ dùng shadow rất nhẹ; ưu tiên border tinh tế và không dùng elevation cao.
- Không khóa giao diện vào một chiều cao thiết bị cụ thể nếu điều đó làm hỏng trải nghiệm trên màn hình thật.
- API camera, sinh trắc học, clipboard và secure storage phải dùng module Expo tương thích cả Android và iOS.

## 4. Quy tắc triển khai

- Ưu tiên component và token thiết kế hiện có.
- Logo ứng dụng chính thức duy nhất là `src/assets/images/identra-logo.png`. Bất cứ khi nào giao diện cần hiển thị app logo hoặc brand Identra, bắt buộc sử dụng asset PNG này thông qua component `AppLogo` hoặc `AppBrandLogo`; không sử dụng lại SVG và không tự dựng logo bằng icon, hình khối hoặc wordmark thay thế.
- Mỗi màn hình hoặc view phải có `nativeID` và `testID` riêng, duy nhất và ổn định.
- ID màn hình dùng tiền tố `screen-` và tên kebab-case, ví dụ `screen-wallet-home` hoặc `screen-data-request`.
- Các trạng thái tạo thành màn hình khác nhau phải có ID khác nhau.
- Không dùng ID màn hình cho card, item hoặc thành phần trang trí.
- Không thêm thành phần chỉ vì nó xuất hiện trong phần chrome của ảnh tham chiếu.
- Mọi nút icon phải có `accessibilityLabel`.
- Vùng chạm tối thiểu là `44x44px`.
- Nội dung không được bị bottom navigation che khuất.
- Kiểm tra giao diện ở chiều rộng `320px`, `390px` và `430px`.
- Kiểm tra cả light mode và dark mode nếu phần được chỉnh sửa hỗ trợ hai chế độ.
- Quick menu “Lịch sử hoạt động” phải mở `screen-activity`; không tạo lại `screen-wallet-history-log`.
- Dữ liệu demo phải có thể xóa hoàn toàn và mọi danh sách liên quan vẫn phải hiển thị empty state hợp lệ.

## 5. Hỗ trợ Android và iOS

- Mọi giao diện và chức năng mobile phải hoạt động tốt trên cả thiết bị Android lẫn iOS.
- Không thiết kế hoặc triển khai chỉ dựa trên hành vi, kích thước hay quy ước riêng của một hệ điều hành.
- Không mô phỏng status bar, home indicator, nút điều hướng hoặc navigation gesture của Android và iOS.
- Tôn trọng safe area trên thiết bị iOS có camera cutout và thiết bị Android có display cutout.
- Sử dụng `react-native-safe-area-context` để lấy đúng safe area trên từng thiết bị.
- Bố cục phải co giãn theo kích thước cửa sổ React Native, không dùng giá trị chiều cao thiết bị cố định.
- Nội dung và hành động quan trọng không được bị che bởi:
  - Bàn phím ảo
  - Bottom navigation của ứng dụng
  - Vùng gesture hoặc thanh điều hướng hệ thống
- Không phụ thuộc vào hover. Mọi thao tác phải hoạt động bằng touch.
- Không phụ thuộc vào cử chỉ vuốt duy nhất; luôn cung cấp nút hoặc hành động thay thế rõ ràng.
- Form phải hoạt động đúng với bàn phím ảo, autofill và `keyboardType` phù hợp.
- Kiểm tra tính tương thích bằng bundle hoặc môi trường mô phỏng Android và iOS, không chỉ bản web preview.
- Tính năng phụ thuộc camera, chia sẻ, clipboard, sinh trắc học hoặc quyền hệ thống phải có phương án dự phòng khi API không được hỗ trợ.

## 6. Checklist trước khi hoàn thành

- [ ] Mỗi màn hình có một ID `screen-*` riêng và không trùng lặp.
- [ ] Không có giờ, pin, Wi-Fi, mạng di động hoặc Dynamic Island giả.
- [ ] Không có home indicator hoặc thanh điều hướng hệ thống giả.
- [ ] Không có khung điện thoại nếu người dùng không yêu cầu mockup.
- [ ] App bar và nội dung bắt đầu đúng vị trí.
- [ ] Bottom navigation chỉ chứa điều hướng thuộc ứng dụng.
- [ ] Bottom navigation có icon, text label và trạng thái active khớp ảnh thiết kế mới nhất.
- [ ] Shadow và elevation của card không đậm hơn ảnh thiết kế.
- [ ] Nội dung không bị che và có thể cuộn đầy đủ.
- [ ] Giao diện khớp phần thiết kế thuộc ứng dụng trong ảnh tham chiếu.
- [ ] Chức năng và tương tác hiện có vẫn hoạt động.
- [ ] Giao diện hoạt động tốt trên cả Android và iOS.
- [ ] Safe area, vùng điều hướng hệ thống và bàn phím ảo không che nội dung.
- [ ] Đã kiểm tra bundle hoặc môi trường mô phỏng tương ứng cho Android và iOS.
- [ ] Các API phụ thuộc thiết bị có phương án dự phòng.
- [ ] Type-check và build thành công.

## 7. Nguyên tắc quyết định

Khi không chắc một thành phần trong ảnh thuộc ứng dụng hay thiết bị, không triển khai thành phần đó cho đến khi đã xác minh từ ngữ cảnh dự án hoặc hỏi lại người dùng.
