---
name: SSI Mobile Design System
version: 0.2.0-alpha
tokens:
  color-light:
    primary: "#5B6CFF"
    primary-hover: "#4A5AF0"
    secondary: "#8F9BFF"
    background: "#F7F8FC"
    surface: "#FFFFFF"
    text-primary: "#1F2937"
    text-secondary: "#6B7280"
    border: "#E5E7EB"
    success: "#22C55E"
    gradient-start: "#5B6CFF"
    gradient-end: "#60A5FA"

  color-dark:
    background: "#0B0F1A"
    surface: "#111827"
    surface-elevated: "#1F2937"
    text-primary: "#E5E7EB"
    text-secondary: "#9CA3AF"
    border: "#374151"
    primary: "#7C8CFF"
    primary-hover: "#6B7BFF"
    gradient-start: "#5B6CFF"
    gradient-end: "#3B82F6"
    success: "#22C55E"

  typography:
    font-family-base: "'Inter', sans-serif"
    font-size-xs: "12px"
    font-size-sm: "14px"
    font-size-md: "16px"
    font-size-lg: "20px"
    font-size-xl: "28px"
    font-size-2xl: "36px"
    font-weight-regular: 400
    font-weight-medium: 500
    font-weight-semibold: 600
    font-weight-bold: 700

  spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
    2xl: "48px"
    3xl: "64px"

  radius:
    sm: "8px"
    md: "12px"
    lg: "20px"
    pill: "999px"

  shadow:
    sm: "0 2px 8px rgba(0,0,0,0.05)"
    md: "0 4px 16px rgba(0,0,0,0.08)"
    lg: "0 10px 30px rgba(0,0,0,0.12)"
---

## Tổng quan

Đây là hệ thống thiết kế cho ứng dụng mobile SSI (Self-Sovereign Identity), tập trung vào việc quản lý danh tính, thông tin xác thực và chia sẻ dữ liệu cá nhân an toàn.

Phong cách thiết kế giữ nguyên tinh thần **hiện đại, tối giản và công nghệ cao** của hệ thống gốc. Giao diện sử dụng nền sáng thoáng, card trắng, màu xanh chủ đạo và gradient nhẹ để tạo cảm giác tin cậy, bảo mật và kiểm soát.

Hệ thống hướng đến:
- Trải nghiệm mobile rõ ràng, thao tác thuận tiện bằng một tay
- Ưu tiên nội dung và hành động quan trọng trên màn hình nhỏ
- Điều hướng nhất quán giữa các chức năng chính
- Tạo cảm giác bảo mật, minh bạch và đáng tin

---

## Nguyên tắc mobile

### Mobile-first

- Thiết kế mặc định cho màn hình rộng từ `320px` đến `430px`.
- Nội dung chính dùng bố cục một cột.
- Không phụ thuộc vào hover; mọi trạng thái tương tác phải hoạt động tốt với touch.
- Trên màn hình lớn hơn, giữ khung ứng dụng tối đa `430px` và căn giữa để bảo toàn trải nghiệm mobile.

### Thao tác một tay

- Hành động thường xuyên đặt ở nửa dưới màn hình hoặc trong bottom navigation.
- Hành động chính của một màn hình nên dễ tiếp cận bằng ngón cái.
- Các nút icon độc lập phải có vùng chạm tối thiểu `44x44px`.

### Phân cấp nội dung

- Mỗi màn hình chỉ có một mục tiêu chính.
- Thông tin quan trọng xuất hiện trước, chi tiết phụ được mở rộng khi cần.
- Dùng card, divider và khoảng trắng để phân nhóm thay vì thêm nhiều màu hoặc shadow.

---

## Màu sắc

Giữ nguyên bảng màu của hệ thống gốc cho cả light mode và dark mode.

### Primary (`#5B6CFF`)

Dùng cho CTA chính, trạng thái active của bottom navigation, focus ring, liên kết và điểm nhấn quan trọng.

Không dùng primary làm nền cho vùng nội dung lớn. Trên một màn hình chỉ nên có một hành động primary nổi bật.

### Background (`#F7F8FC`)

Dùng làm nền tổng thể của ứng dụng ở light mode, giúp card trắng nổi bật và giao diện nhẹ, thoáng.

### Surface (`#FFFFFF`)

Dùng cho card, app bar, bottom navigation, form, modal và bottom sheet.

### Text Primary (`#1F2937`)

Dùng cho tiêu đề, nội dung chính và thông tin quan trọng. Đảm bảo độ tương phản WCAG AA.

### Text Secondary (`#6B7280`)

Dùng cho mô tả, metadata, nhãn phụ và trạng thái ít quan trọng hơn.

### Border (`#E5E7EB`)

Dùng cho divider, input và viền card. Border cần nhẹ để không làm giao diện nặng nề.

### Success (`#22C55E`)

Dùng cho trạng thái đã xác minh, hoàn tất hoặc kết nối an toàn. Không dùng thay cho CTA chính.

### Dark mode

- Background: `#0B0F1A`
- Surface: `#111827`
- Surface elevated: `#1F2937`
- Text primary: `#E5E7EB`
- Text secondary: `#9CA3AF`
- Border: `#374151`
- Primary: `#7C8CFF`

Dark mode giữ nguyên cấu trúc và phân cấp của light mode, chỉ thay đổi token màu tương ứng.

---

## Typography

### Font family

`Inter, sans-serif`

Font hiện đại, dễ đọc trên màn hình nhỏ và phù hợp với sản phẩm công nghệ.

### Mobile heading

- Screen title: `28px / Bold`
- Section title: `20px / Semibold`
- Card title: `16px / Semibold`
- Compact label: `14px / Semibold`

Không dùng `36px` cho nội dung ứng dụng thông thường; token này chỉ dành cho onboarding hoặc màn hình giới thiệu đặc biệt.

### Body

- Default: `16px / Regular`
- Compact body: `14px / Regular`
- Metadata: `12px / Medium`

Body text dùng line-height khoảng `1.45–1.6`. Không dùng cỡ chữ nhỏ hơn `12px`.

---

## Khung ứng dụng

### Mobile viewport

- Chiều rộng thiết kế tham chiếu: `390px`
- Chiều rộng hỗ trợ: `320px–430px`
- Chiều rộng tối đa khi hiển thị trên desktop: `430px`
- Nền app: `{color.background}`
- Nội dung cuộn theo chiều dọc, không cuộn ngang

### Safe area

- Tôn trọng `safe-area-inset-top` và `safe-area-inset-bottom`.
- Không đặt CTA, input hoặc nội dung quan trọng sát camera cutout, status bar hay home indicator.
- Bottom navigation phải cộng thêm bottom safe area trên thiết bị hỗ trợ.

### Content container

- Padding ngang mặc định: `16px`
- Padding ngang cho màn hình rộng: tối đa `24px`
- Khoảng cách giữa các section: `24px`
- Khoảng cách giữa các item liên quan: `8px–16px`

### Grid

- Dùng lưới `4 cột` cho quick actions và dashboard compact.
- Gap mặc định: `8px` hoặc `12px`.
- Nội dung và form chính luôn ưu tiên một cột.
- Chỉ dùng hai cột khi mỗi item vẫn đảm bảo vùng chạm và nội dung dễ đọc.

### Vertical structure

Một màn hình tiêu chuẩn gồm:
1. Status bar hoặc safe area phía trên
2. App bar
3. Vùng nội dung cuộn
4. CTA cố định nếu tác vụ yêu cầu
5. Bottom navigation cho các màn hình cấp cao nhất

---

## Điều hướng

### App bar

- Chiều cao nội dung: `56px`
- Background: `{color.surface}` hoặc trong suốt khi cùng màu nền
- Padding ngang: `16px`
- Tiêu đề căn trái
- Nút back hoặc menu ở trái; tối đa hai action ở phải
- Icon có kích thước trực quan `20–24px`, vùng chạm tối thiểu `44x44px`

App bar có thể sticky khi màn hình dài. Chỉ thêm border dưới khi cần phân tách với nội dung.

### Bottom navigation

- Chiều cao cơ sở: `72px`, chưa tính safe area
- Background: `{color.surface}` với blur nhẹ khi phù hợp
- Border-top: `1px solid {color.border}`
- Từ `3–5` mục điều hướng cấp cao nhất
- Mục active dùng `{color.primary}`; mục inactive dùng `{color.text-secondary}`
- Mỗi mục hiển thị icon và text label ngắn bên dưới, đúng theo ảnh thiết kế đã được phê duyệt
- Icon và text label của mục active cùng dùng `{color.primary}`
- Không thêm nền bo tròn, pill hoặc khối màu phía sau mục active nếu ảnh thiết kế không có
- Text label không thay thế accessibility label

Không dùng bottom navigation cho hành động tạm thời hoặc luồng con.

### Side drawer

Side drawer chỉ dành cho chức năng phụ, thông tin tài khoản hoặc mục ít sử dụng. Không thay thế bottom navigation cho các khu vực chính.

### Bottom sheet

Dùng bottom sheet cho lựa chọn ngắn, xác nhận hoặc hành động theo ngữ cảnh.

- Radius góc trên: `{radius.lg}`
- Padding: `{spacing.md}` hoặc `{spacing.lg}`
- Có drag handle khi sheet có thể kéo
- Không che mất ngữ cảnh cần thiết cho quyết định của người dùng

---

## Components

### Primary button

- Height: tối thiểu `48px`
- Background: `{color.primary}`
- Text: white
- Padding ngang: `20px`
- Radius: `{radius.md}` hoặc `{radius.pill}`
- Font weight: `600`
- Trạng thái pressed: `{color.primary-hover}`
- CTA chính trong form hoặc flow nên rộng `100%`

### Secondary button

- Height: tối thiểu `44px`
- Border: `1px solid {color.border}`
- Background: `{color.surface}`
- Text: `{color.text-primary}`

Dùng cho hành động phụ, không cạnh tranh thị giác với primary button.

### Icon button

- Vùng chạm tối thiểu: `44x44px`
- Icon: `20–24px`
- Có label hỗ trợ accessibility
- Trạng thái pressed dùng nền primary với opacity thấp hoặc surface elevated

### Card

- Background: `{color.surface}`
- Radius: `16–20px`
- Padding: `{spacing.md}` hoặc `{spacing.lg}`
- Border: `1px solid {color.border}` khi cần
- Shadow: `{shadow.sm}`

Card dùng để nhóm credential, trạng thái bảo mật, hoạt động gần đây và tác vụ nhanh. Tránh card lồng quá hai cấp.

### List item

- Chiều cao tối thiểu: `56px`
- Padding dọc: `12–16px`
- Có thể gồm leading icon/avatar, title, supporting text và trailing action
- Divider căn theo nội dung, không nhất thiết kéo toàn chiều rộng

### Input và form

- Height: tối thiểu `48px`
- Border: `1px solid {color.border}`
- Radius: `{radius.md}`
- Padding ngang: `16px`
- Label luôn hiển thị; không dùng placeholder thay cho label
- Focus: border hoặc ring `{color.primary}`
- Error hiển thị gần trường nhập và mô tả cách khắc phục

Form dài chia thành section rõ ràng. CTA submit đặt cuối form hoặc cố định phía dưới khi cần.

### Toggle

- Vùng chạm tối thiểu: `44px`
- Trạng thái bật dùng `{color.primary}`
- Luôn đi kèm label rõ nghĩa
- Thay đổi nhạy cảm cần xác nhận hoặc giải thích hậu quả

### Credential card

- Hiển thị loại credential, đơn vị cấp, trạng thái xác minh và thời hạn
- Trạng thái hợp lệ dùng `{color.success}`
- Toàn bộ card có thể chạm để mở chi tiết
- Thông tin nhạy cảm được che mặc định khi phù hợp

### QR scanner

- Camera preview chiếm phần lớn vùng nội dung
- Khung quét có độ tương phản cao với màu `{color.primary}`
- Có hướng dẫn ngắn, trạng thái xử lý và phương án tải ảnh
- Luôn cung cấp cách thoát hoặc quay lại rõ ràng

### Modal

Chỉ dùng modal cho xác nhận quan trọng hoặc cảnh báo cần chặn luồng. Trên mobile, ưu tiên bottom sheet cho lựa chọn thông thường.

---

## Trạng thái và phản hồi

### Loading

- Dùng skeleton cho danh sách và card.
- Dùng spinner cho hành động ngắn, có phạm vi rõ ràng.
- Không khóa toàn màn hình nếu chỉ một thành phần đang tải.

### Empty state

- Giải thích ngắn gọn lý do chưa có dữ liệu.
- Cung cấp một hành động tiếp theo rõ ràng.
- Hình minh họa, nếu có, phải nhẹ và không lấn át CTA.

### Error

- Nêu vấn đề bằng ngôn ngữ dễ hiểu.
- Giữ lại dữ liệu người dùng đã nhập.
- Cho phép thử lại hoặc quay về trạng thái an toàn.

### Feedback khi chạm

- Mọi thành phần tương tác cần có trạng thái pressed rõ ràng.
- Có thể dùng scale rất nhẹ, thay đổi màu nền hoặc opacity.
- Animation phản hồi nên hoàn tất trong khoảng `150–250ms`.

---

## Motion

- Motion dùng để giải thích chuyển trạng thái, không chỉ để trang trí.
- Chuyển màn hình: `200–300ms`.
- Press feedback: `100–150ms`.
- Bottom sheet xuất hiện từ dưới lên.
- Tôn trọng `prefers-reduced-motion`.
- Không dùng nhiều animation đồng thời trên màn hình chứa dữ liệu nhạy cảm.

---

## Do's and Don'ts

### Do's

- Giữ bố cục một cột rõ ràng trên màn hình nhỏ
- Đặt hành động thường xuyên trong vùng dễ chạm
- Dùng primary color cho CTA và trạng thái active
- Giữ spacing theo hệ `8px`
- Dùng shadow nhẹ và border tinh tế để tạo phân cấp
- Hiển thị trạng thái xác minh và quyền chia sẻ minh bạch
- Kiểm tra giao diện ở cả light mode và dark mode

### Don'ts

- Không chuyển bố cục desktop nhiều cột trực tiếp xuống mobile
- Không phụ thuộc vào hover để truyền tải thông tin
- Không đặt quá nhiều CTA primary trên cùng một màn hình
- Không dùng vùng chạm nhỏ hơn `44x44px`
- Không đặt nội dung quan trọng dưới bottom navigation hoặc safe area
- Không trộn nhiều font family
- Không dùng gradient hoặc primary làm nền cho vùng nội dung lớn
- Không dùng border đậm hoặc shadow quá nặng
- Không phá vỡ spacing system bằng giá trị ngẫu nhiên

---

## Accessibility

- Contrast text đạt tối thiểu `4.5:1` theo WCAG AA
- Vùng chạm tối thiểu `44x44px`
- Font size nội dung chính tối thiểu `14px`
- Icon button có accessible label
- Focus state luôn hiển thị khi dùng bàn phím hoặc thiết bị hỗ trợ
- Không truyền đạt trạng thái chỉ bằng màu sắc
- Hỗ trợ tăng cỡ chữ mà không làm mất nội dung hoặc hành động chính
- Nội dung đọc theo thứ tự hợp lý với screen reader

---

## Responsive preview

Ứng dụng là mobile-first nhưng có thể được xem trên desktop để demo:

- Giữ khung ứng dụng tối đa `430px`, căn giữa màn hình.
- Có thể thêm viền và radius bên ngoài khung để mô phỏng thiết bị.
- Không mở rộng nội dung thành landing page hoặc dashboard desktop.
- Chức năng, thứ tự nội dung và điều hướng phải giống phiên bản mobile thật.

---

## Tóm tắt

Hệ thống thiết kế mobile này giữ nguyên ba giá trị cốt lõi:

- **Clarity**
- **Trust**
- **Modern minimalism**

Mọi màn hình cần mang lại cảm giác dễ hiểu, dễ thao tác bằng một tay, minh bạch về dữ liệu và đáng tin cậy trong từng hành động.
