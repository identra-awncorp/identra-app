export interface PaymentFlowConfig {
  id: string;
  title: string;
  description: string;
  status: string;
  primaryAction: string;
  steps: { title: string; description: string }[];
}

export const paymentFlowConfigs: Record<string, PaymentFlowConfig> = {
  transfer: {
    id: 'transfer',
    title: 'Chuyển tiền',
    description: 'Chọn người nhận, nhập số tiền và xác thực giao dịch.',
    status: 'Flow chính',
    primaryAction: 'Bắt đầu chuyển tiền',
    steps: [
      { title: 'Chọn người nhận', description: 'Tìm trong danh bạ, IDPay hoặc nhập số tài khoản.' },
      { title: 'Nhập số tiền', description: 'Chọn nguồn tiền, nội dung và phí giao dịch.' },
      { title: 'Xác nhận', description: 'Kiểm tra thông tin trước khi xác thực.' },
    ],
  },
  receive: {
    id: 'receive',
    title: 'Nhận tiền',
    description: 'Tạo QR hoặc chia sẻ thông tin IDPay để nhận tiền.',
    status: 'Flow nhận tiền',
    primaryAction: 'Tạo QR nhận tiền',
    steps: [
      { title: 'Chọn tài khoản nhận', description: 'Dùng tài khoản chính hoặc tài khoản phụ.' },
      { title: 'Nhập số tiền tùy chọn', description: 'Có thể để trống để người gửi tự nhập.' },
      { title: 'Chia sẻ QR', description: 'Gửi QR qua chat hoặc lưu về thiết bị.' },
    ],
  },
  phone: {
    id: 'phone',
    title: 'Nạp tiền điện thoại',
    description: 'Nạp tiền hoặc mua gói cước cho số điện thoại.',
    status: 'Topup',
    primaryAction: 'Chọn số điện thoại',
    steps: [
      { title: 'Chọn số điện thoại', description: 'Nhập số mới hoặc chọn từ danh bạ.' },
      { title: 'Chọn mệnh giá', description: 'Xem khuyến mãi đang có theo nhà mạng.' },
      { title: 'Xác nhận thanh toán', description: 'Xác thực giao dịch trước khi nạp.' },
    ],
  },
  bill: {
    id: 'bill',
    title: 'Thanh toán hóa đơn',
    description: 'Thanh toán điện, nước, internet, học phí và dịch vụ.',
    status: 'Hóa đơn',
    primaryAction: 'Chọn loại hóa đơn',
    steps: [
      { title: 'Chọn nhà cung cấp', description: 'Tìm theo danh mục hoặc tên đơn vị.' },
      { title: 'Nhập mã khách hàng', description: 'Tra cứu hóa đơn cần thanh toán.' },
      { title: 'Thanh toán', description: 'Xác nhận số tiền và nguồn tiền.' },
    ],
  },
  withdraw: {
    id: 'withdraw',
    title: 'Rút tiền',
    description: 'Tạo mã rút tiền hoặc rút về tài khoản ngân hàng.',
    status: 'Rút tiền',
    primaryAction: 'Chọn phương thức',
    steps: [
      { title: 'Chọn phương thức rút', description: 'ATM QR, mã rút tiền hoặc chuyển về ngân hàng.' },
      { title: 'Nhập số tiền', description: 'Kiểm tra hạn mức và phí nếu có.' },
      { title: 'Nhận mã rút tiền', description: 'Mã có thời hạn và cần bảo mật.' },
    ],
  },
  history: {
    id: 'history',
    title: 'Lịch sử giao dịch',
    description: 'Xem, lọc và mở chi tiết các giao dịch Identra Pay.',
    status: 'Lịch sử',
    primaryAction: 'Xem giao dịch gần đây',
    steps: [
      { title: 'Danh sách giao dịch', description: 'Hiển thị giao dịch mới nhất theo thời gian.' },
      { title: 'Bộ lọc', description: 'Lọc theo trạng thái, loại giao dịch và thời gian.' },
      { title: 'Biên lai', description: 'Mở chi tiết, chia sẻ hoặc báo lỗi giao dịch.' },
    ],
  },
  split: {
    id: 'split',
    title: 'Chia hóa đơn',
    description: 'Tạo yêu cầu chia tiền cho nhóm bạn hoặc nhóm chat.',
    status: 'Nhóm',
    primaryAction: 'Tạo hóa đơn chia',
    steps: [
      { title: 'Nhập tổng tiền', description: 'Thêm nội dung và ảnh hóa đơn nếu có.' },
      { title: 'Chọn người tham gia', description: 'Chia đều hoặc tùy chỉnh từng người.' },
      { title: 'Theo dõi trạng thái', description: 'Nhắc người chưa thanh toán.' },
    ],
  },
  utilities: {
    id: 'utilities',
    title: 'Điện nước',
    description: 'Thanh toán nhanh các dịch vụ tiện ích hằng tháng.',
    status: 'Tiện ích',
    primaryAction: 'Tra cứu hóa đơn',
    steps: [
      { title: 'Chọn dịch vụ', description: 'Điện, nước, internet hoặc truyền hình.' },
      { title: 'Tra cứu mã khách hàng', description: 'Lưu mã để dùng cho lần sau.' },
      { title: 'Thanh toán định kỳ', description: 'Có thể bật nhắc hẹn khi hóa đơn mới đến.' },
    ],
  },
  qr: {
    id: 'qr',
    title: 'Quét mã QR',
    description: 'Quét QR để thanh toán hoặc nhận thông tin chuyển khoản.',
    status: 'QR',
    primaryAction: 'Mở trình quét',
    steps: [
      { title: 'Quét mã', description: 'Đọc QR từ camera hoặc thư viện ảnh.' },
      { title: 'Kiểm tra thông tin', description: 'Xác nhận người nhận, số tiền và nội dung.' },
      { title: 'Xác thực', description: 'Hoàn tất thanh toán bằng bảo mật thiết bị.' },
    ],
  },
  wallet: {
    id: 'wallet',
    title: 'Ví IDPay',
    description: 'Quản lý ví, nguồn tiền và hạn mức thanh toán.',
    status: 'Ví',
    primaryAction: 'Xem ví IDPay',
    steps: [
      { title: 'Nguồn tiền', description: 'Tài khoản chính, thẻ và ví liên kết.' },
      { title: 'Hạn mức', description: 'Kiểm soát hạn mức ngày và giao dịch online.' },
      { title: 'Bảo mật', description: 'Thiết lập xác thực cho ví.' },
    ],
  },
  business: {
    id: 'business',
    title: 'Mở tài khoản kinh doanh',
    description: 'Tạo tài khoản nhận tiền cho cửa hàng hoặc dịch vụ cá nhân.',
    status: 'Đề xuất',
    primaryAction: 'Xem điều kiện mở',
    steps: [
      { title: 'Thông tin kinh doanh', description: 'Cập nhật hồ sơ và ngành nghề.' },
      { title: 'Xác minh', description: 'Dùng credential để rút ngắn quá trình duyệt.' },
      { title: 'Nhận thanh toán', description: 'Tạo QR và quản lý dòng tiền.' },
    ],
  },
  traffic: {
    id: 'traffic',
    title: 'Tra cứu phạt nguội',
    description: 'Tra cứu vi phạm giao thông và thanh toán lệ phí nếu có.',
    status: 'Dịch vụ công',
    primaryAction: 'Nhập biển số',
    steps: [
      { title: 'Nhập biển số', description: 'Hỗ trợ ô tô và xe máy.' },
      { title: 'Tra cứu kết quả', description: 'Hiển thị trạng thái và nơi xử lý.' },
      { title: 'Thanh toán', description: 'Thanh toán khoản phí đủ điều kiện.' },
    ],
  },
  stocks: {
    id: 'stocks',
    title: 'Chứng khoán',
    description: 'Khám phá tài khoản đầu tư và nạp tiền giao dịch.',
    status: 'Đầu tư',
    primaryAction: 'Tìm hiểu chứng khoán',
    steps: [
      { title: 'Mở tài khoản', description: 'Xác minh danh tính bằng hồ sơ Identra.' },
      { title: 'Nạp tiền', description: 'Chuyển tiền từ tài khoản chính.' },
      { title: 'Theo dõi', description: 'Xem biến động và lịch sử lệnh.' },
    ],
  },
  saving: {
    id: 'saving',
    title: 'Tiết kiệm',
    description: 'Tạo mục tiêu và gửi góp định kỳ.',
    status: 'Tài chính',
    primaryAction: 'Tạo mục tiêu',
    steps: [
      { title: 'Chọn mục tiêu', description: 'Đặt tên, kỳ hạn và số tiền mong muốn.' },
      { title: 'Thiết lập gửi góp', description: 'Chọn lịch tự động hoặc gửi thủ công.' },
      { title: 'Theo dõi tiến độ', description: 'Nhận nhắc hẹn khi gần đạt mục tiêu.' },
    ],
  },
  rewards: {
    id: 'rewards',
    title: 'Hoàn tiền',
    description: 'Theo dõi điểm thưởng, hoàn tiền và voucher đã nhận.',
    status: 'Ưu đãi',
    primaryAction: 'Xem hoàn tiền',
    steps: [
      { title: 'Ưu đãi khả dụng', description: 'Xem điều kiện và thời hạn sử dụng.' },
      { title: 'Kích hoạt', description: 'Nhận voucher trước khi thanh toán.' },
      { title: 'Theo dõi', description: 'Kiểm tra hoàn tiền sau giao dịch.' },
    ],
  },
  insurance: {
    id: 'insurance',
    title: 'Bảo hiểm',
    description: 'Quản lý gói bảo hiểm và thanh toán phí định kỳ.',
    status: 'Bảo vệ',
    primaryAction: 'Xem gói phù hợp',
    steps: [
      { title: 'Chọn nhu cầu', description: 'Sức khỏe, du lịch, xe hoặc tài sản.' },
      { title: 'So sánh gói', description: 'Xem quyền lợi và phí dự kiến.' },
      { title: 'Thanh toán phí', description: 'Lưu hợp đồng trong ví Identra.' },
    ],
  },
  cashback: {
    id: 'cashback',
    title: 'Thanh toán dễ dàng',
    description: 'Khám phá chương trình hoàn tiền khi thanh toán bằng Identra Pay.',
    status: 'Banner',
    primaryAction: 'Xem chương trình',
    steps: [
      { title: 'Điều kiện', description: 'Áp dụng cho giao dịch đủ điều kiện trong tháng.' },
      { title: 'Thanh toán', description: 'Dùng Identra Pay tại đối tác hỗ trợ.' },
      { title: 'Nhận hoàn tiền', description: 'Hoàn tiền về tài khoản chính sau khi giao dịch ghi nhận.' },
    ],
  },
  security: {
    id: 'security',
    title: 'Bảo vệ mọi giao dịch',
    description: 'Thiết lập xác thực, cảnh báo và khóa thẻ nhanh.',
    status: 'Bảo mật',
    primaryAction: 'Mở quản lý bảo mật',
    steps: [
      { title: 'Xác thực', description: 'Bật sinh trắc học cho giao dịch quan trọng.' },
      { title: 'Cảnh báo', description: 'Nhận thông báo khi có chi tiêu bất thường.' },
      { title: 'Khóa nhanh', description: 'Khóa thẻ hoặc ví ngay khi cần.' },
    ],
  },
  shopping: {
    id: 'shopping',
    title: 'Hoàn tiền 20%',
    description: 'Ưu đãi mua sắm cuối tuần cho người dùng Identra Pay.',
    status: 'Ưu đãi',
    primaryAction: 'Nhận ưu đãi',
    steps: [
      { title: 'Nhận voucher', description: 'Lưu ưu đãi trước khi thanh toán.' },
      { title: 'Mua sắm', description: 'Thanh toán bằng thẻ hoặc ví Identra Pay.' },
      { title: 'Hoàn tiền', description: 'Tiền hoàn được cộng về tài khoản chính.' },
    ],
  },
  card: {
    id: 'card',
    title: 'Thẻ ảo miễn phí',
    description: 'Tạo thẻ ảo cho mua sắm online và quản lý hạn mức riêng.',
    status: 'Thẻ',
    primaryAction: 'Tạo thẻ ảo',
    steps: [
      { title: 'Tạo thẻ', description: 'Chọn nguồn tiền và tên thẻ.' },
      { title: 'Đặt hạn mức', description: 'Giới hạn chi tiêu cho từng mục đích.' },
      { title: 'Thanh toán online', description: 'Dùng thẻ ảo thay cho thẻ chính.' },
    ],
  },
  voucher: {
    id: 'voucher',
    title: 'Ưu đãi hóa đơn',
    description: 'Giảm phí khi thanh toán điện, nước và internet.',
    status: 'Voucher',
    primaryAction: 'Lưu voucher',
    steps: [
      { title: 'Lưu ưu đãi', description: 'Kiểm tra thời hạn và điều kiện.' },
      { title: 'Thanh toán hóa đơn', description: 'Áp dụng khi thanh toán dịch vụ đủ điều kiện.' },
      { title: 'Xem lịch sử', description: 'Theo dõi khoản giảm phí trong biên lai.' },
    ],
  },
};

export function getPaymentFlowConfig(flow?: string | string[]) {
  const key = Array.isArray(flow) ? flow[0] : flow;
  return paymentFlowConfigs[key ?? 'transfer'] ?? paymentFlowConfigs.transfer;
}
