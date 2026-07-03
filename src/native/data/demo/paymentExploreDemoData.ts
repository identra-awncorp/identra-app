import {
  BadgePercent,
  BriefcaseBusiness,
  Car,
  ChartCandlestick,
  CreditCard,
  Gift,
  HandCoins,
  Landmark,
  Percent,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';

import type { GradientColors } from '../../screens/payment/paymentTypes';

export type PaymentExploreSection = 'suggestion' | 'offer';
export type PaymentExploreActionTarget = 'activate' | 'bill' | 'business' | 'card' | 'saving' | 'security' | 'service';

export interface PaymentExploreDetail {
  id: string;
  section: PaymentExploreSection;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  actionLabel: string;
  actionTarget: PaymentExploreActionTarget;
  gradient: GradientColors;
  icon: LucideIcon;
  color: string;
  background: string;
  reward: string;
  validUntil: string;
  benefits: string[];
  steps: { title: string; description: string }[];
  conditions: string[];
}

export const paymentExploreDetails: PaymentExploreDetail[] = [
  {
    id: 'business',
    section: 'suggestion',
    title: 'Mở tài khoản kinh doanh',
    subtitle: 'Tài khoản nhận tiền cho cửa hàng và dịch vụ cá nhân.',
    description: 'Tạo hồ sơ kinh doanh, nhận thanh toán qua QR và theo dõi dòng tiền ngay trong Identra Pay.',
    badge: 'Đề xuất',
    actionLabel: 'Đăng ký quan tâm',
    actionTarget: 'business',
    gradient: ['#EEF2FF', '#D8E1FF', '#F7FBFF'],
    icon: BriefcaseBusiness,
    color: '#335CFF',
    background: '#EEF2FF',
    reward: 'Miễn phí 3 tháng',
    validUntil: '31/08/2026',
    benefits: ['Tạo QR nhận tiền riêng cho cửa hàng.', 'Phân loại doanh thu theo ngày, tuần, tháng.', 'Rút ngắn xác minh bằng hồ sơ Identra.'],
    steps: [
      { title: 'Bổ sung thông tin', description: 'Nhập tên cửa hàng, ngành nghề và tài khoản nhận tiền.' },
      { title: 'Xác minh nhanh', description: 'Dùng credential đã có để rút ngắn bước kiểm duyệt.' },
      { title: 'Bắt đầu nhận tiền', description: 'Tạo QR, chia sẻ link thanh toán và xem báo cáo.' },
    ],
    conditions: ['Áp dụng cho người dùng đã xác minh danh tính.', 'Một người dùng có thể tạo tối đa 2 hồ sơ kinh doanh trong bản demo.'],
  },
  {
    id: 'traffic',
    section: 'suggestion',
    title: 'Tra cứu phạt nguội',
    subtitle: 'Kiểm tra vi phạm giao thông và lưu biển số thường dùng.',
    description: 'Nhập biển số, xem trạng thái xử lý và nhận nhắc hạn thanh toán khi dịch vụ được ghép API.',
    badge: 'Dịch vụ công',
    actionLabel: 'Lưu biển số',
    actionTarget: 'service',
    gradient: ['#FFF0EC', '#FFE2D8', '#FFF8F5'],
    icon: Car,
    color: '#F06445',
    background: '#FFF0EC',
    reward: 'Nhắc hạn miễn phí',
    validUntil: 'Luôn khả dụng',
    benefits: ['Lưu nhiều biển số để tra cứu lại nhanh.', 'Tổng hợp trạng thái và nơi xử lý.', 'Nhận nhắc khi có khoản cần thanh toán.'],
    steps: [
      { title: 'Nhập biển số', description: 'Hỗ trợ ô tô và xe máy.' },
      { title: 'Tra cứu kết quả', description: 'Hiển thị trạng thái, thời gian và nơi xử lý.' },
      { title: 'Theo dõi', description: 'Bật nhắc hạn khi có dữ liệu mới.' },
    ],
    conditions: ['Dữ liệu demo chưa kết nối hệ thống xử phạt.', 'Kết quả chính thức sẽ phụ thuộc nhà cung cấp dịch vụ.'],
  },
  {
    id: 'stocks',
    section: 'suggestion',
    title: 'Chứng khoán',
    subtitle: 'Khám phá tài khoản đầu tư và nạp tiền giao dịch.',
    description: 'Theo dõi trạng thái mở tài khoản, nạp tiền từ Identra Pay và lưu các mã quan tâm.',
    badge: 'Đầu tư',
    actionLabel: 'Đăng ký tư vấn',
    actionTarget: 'service',
    gradient: ['#E9FAF2', '#D0F5E3', '#F7FFFB'],
    icon: ChartCandlestick,
    color: '#13A06D',
    background: '#E9FAF2',
    reward: 'Miễn phí mở tài khoản',
    validUntil: '30/09/2026',
    benefits: ['Theo dõi danh mục quan tâm.', 'Nạp tiền từ tài khoản chính.', 'Tái sử dụng hồ sơ KYC trong Identra.'],
    steps: [
      { title: 'Kiểm tra điều kiện', description: 'Xác minh độ tuổi và hồ sơ định danh.' },
      { title: 'Mở tài khoản', description: 'Gửi yêu cầu sang đối tác chứng khoán.' },
      { title: 'Nạp tiền', description: 'Chuyển tiền từ Identra Pay khi tài khoản sẵn sàng.' },
    ],
    conditions: ['Sản phẩm đầu tư có rủi ro thị trường.', 'Nội dung hiện tại chỉ là demo luồng UI.'],
  },
  {
    id: 'saving',
    section: 'suggestion',
    title: 'Tiết kiệm',
    subtitle: 'Tạo mục tiêu tiết kiệm và gửi góp theo lịch.',
    description: 'Chia tiền thành từng mục tiêu, theo dõi tiến độ và nhận nhắc khi gần đạt mốc.',
    badge: 'Tài chính',
    actionLabel: 'Tạo mục tiêu',
    actionTarget: 'saving',
    gradient: ['#F2ECFF', '#E4D8FF', '#FBF8FF'],
    icon: Landmark,
    color: '#8563E9',
    background: '#F2ECFF',
    reward: 'Gợi ý lịch gửi góp',
    validUntil: 'Luôn khả dụng',
    benefits: ['Đặt mục tiêu theo số tiền và thời hạn.', 'Gợi ý mức gửi góp phù hợp dòng tiền.', 'Theo dõi tiến độ bằng giao dịch thực tế.'],
    steps: [
      { title: 'Đặt mục tiêu', description: 'Đặt tên, số tiền và ngày mong muốn hoàn thành.' },
      { title: 'Chọn lịch gửi', description: 'Gửi thủ công hoặc đặt nhắc hằng tuần.' },
      { title: 'Theo dõi', description: 'Xem tiến độ trong ví IDPay.' },
    ],
    conditions: ['Lãi suất và sản phẩm thật sẽ được hiển thị khi ghép API ngân hàng.', 'Demo hiện chỉ lưu lựa chọn trên giao diện.'],
  },
  {
    id: 'rewards',
    section: 'suggestion',
    title: 'Hoàn tiền',
    subtitle: 'Theo dõi ưu đãi và khoản hoàn tiền đã nhận.',
    description: 'Xem các chương trình có thể kích hoạt trước khi thanh toán bằng Identra Pay.',
    badge: 'Ưu đãi',
    actionLabel: 'Kích hoạt ưu đãi',
    actionTarget: 'activate',
    gradient: ['#FFF3E5', '#FFE4C2', '#FFF9F0'],
    icon: Gift,
    color: '#E78318',
    background: '#FFF3E5',
    reward: 'Hoàn tới 10%',
    validUntil: '31/07/2026',
    benefits: ['Gợi ý ưu đãi theo thói quen thanh toán.', 'Theo dõi khoản hoàn tiền trong lịch sử.', 'Nhận thông báo khi ưu đãi sắp hết hạn.'],
    steps: [
      { title: 'Kích hoạt', description: 'Lưu chương trình vào ví ưu đãi.' },
      { title: 'Thanh toán', description: 'Dùng Identra Pay tại đối tác hỗ trợ.' },
      { title: 'Nhận hoàn tiền', description: 'Khoản hoàn được ghi nhận sau giao dịch đủ điều kiện.' },
    ],
    conditions: ['Mỗi ưu đãi có hạn mức hoàn tiền riêng.', 'Không áp dụng đồng thời với một số voucher đối tác.'],
  },
  {
    id: 'insurance',
    section: 'suggestion',
    title: 'Bảo hiểm',
    subtitle: 'Khám phá gói bảo vệ phù hợp với hồ sơ của bạn.',
    description: 'So sánh quyền lợi, phí dự kiến và thanh toán định kỳ bằng tài khoản chính.',
    badge: 'Bảo vệ',
    actionLabel: 'Xem gói phù hợp',
    actionTarget: 'service',
    gradient: ['#EAF3FF', '#D7E9FF', '#F5FAFF'],
    icon: ShieldCheck,
    color: '#2C7BE5',
    background: '#EAF3FF',
    reward: 'Ưu đãi phí năm đầu',
    validUntil: '15/08/2026',
    benefits: ['Gợi ý gói theo nhu cầu.', 'Lưu hợp đồng trong ví Identra.', 'Nhắc hạn đóng phí định kỳ.'],
    steps: [
      { title: 'Chọn nhu cầu', description: 'Sức khỏe, xe, du lịch hoặc tài sản.' },
      { title: 'So sánh gói', description: 'Xem quyền lợi và phí dự kiến.' },
      { title: 'Thanh toán', description: 'Lưu lịch đóng phí vào Identra Pay.' },
    ],
    conditions: ['Quyền lợi bảo hiểm phụ thuộc đối tác phát hành.', 'Thông tin trong demo chưa phải tư vấn tài chính.'],
  },
  {
    id: 'shopping',
    section: 'offer',
    title: 'Hoàn tiền 20%',
    subtitle: 'Ưu đãi mua sắm cuối tuần bằng Identra Pay.',
    description: 'Lưu ưu đãi trước khi thanh toán để nhận hoàn tiền cho giao dịch đủ điều kiện.',
    badge: 'Ưu đãi',
    actionLabel: 'Lưu ưu đãi',
    actionTarget: 'activate',
    gradient: ['#EAF2FF', '#C7D7FF'],
    icon: BadgePercent,
    color: '#335CFF',
    background: '#EEF2FF',
    reward: 'Hoàn tối đa 20%',
    validUntil: '07/07/2026',
    benefits: ['Áp dụng cho cuối tuần.', 'Tự động ghi nhận khi thanh toán bằng Identra Pay.', 'Xem trạng thái hoàn tiền trong lịch sử.'],
    steps: [
      { title: 'Lưu ưu đãi', description: 'Kích hoạt trước khi mua sắm.' },
      { title: 'Thanh toán', description: 'Dùng Identra Pay tại đối tác hỗ trợ.' },
      { title: 'Nhận hoàn tiền', description: 'Khoản hoàn được cộng về tài khoản chính.' },
    ],
    conditions: ['Áp dụng một lần mỗi người dùng.', 'Hạn mức hoàn tối đa 80.000 VND.'],
  },
  {
    id: 'saving',
    section: 'offer',
    title: 'Gửi góp linh hoạt',
    subtitle: 'Tạo mục tiêu tiết kiệm chỉ trong vài chạm.',
    description: 'Bắt đầu gửi góp theo lịch nhẹ nhàng và theo dõi tiến độ ngay trong ví.',
    badge: 'Tài chính',
    actionLabel: 'Tạo mục tiêu',
    actionTarget: 'saving',
    gradient: ['#EAFDF4', '#C8F1DE'],
    icon: HandCoins,
    color: '#12B76A',
    background: '#EAFDF4',
    reward: 'Nhắc lịch miễn phí',
    validUntil: 'Luôn khả dụng',
    benefits: ['Chia nhỏ số tiền cần tiết kiệm.', 'Nhận nhắc lịch gửi góp.', 'Theo dõi tiến độ bằng biểu đồ.'],
    steps: [
      { title: 'Đặt mục tiêu', description: 'Nhập số tiền và thời hạn.' },
      { title: 'Chọn nguồn tiền', description: 'Dùng tài khoản chính hoặc ví IDPay.' },
      { title: 'Theo dõi', description: 'Cập nhật tiến độ khi có giao dịch.' },
    ],
    conditions: ['Tính năng lãi suất thật sẽ cần API ngân hàng.', 'Demo hiện chưa tạo sản phẩm tiền gửi thực.'],
  },
  {
    id: 'card',
    section: 'offer',
    title: 'Thẻ ảo miễn phí',
    subtitle: 'Tách ngân sách riêng cho mua sắm online.',
    description: 'Tạo thẻ ảo để kiểm soát hạn mức và giảm rủi ro khi thanh toán trực tuyến.',
    badge: 'Thẻ',
    actionLabel: 'Mở quản lý thẻ',
    actionTarget: 'card',
    gradient: ['#F2ECFF', '#D9CAFF'],
    icon: CreditCard,
    color: '#8563E9',
    background: '#F2ECFF',
    reward: 'Miễn phí phát hành',
    validUntil: '31/08/2026',
    benefits: ['Đặt hạn mức riêng cho thẻ ảo.', 'Khóa/mở nhanh trong app.', 'Dùng cho mua sắm online an toàn hơn.'],
    steps: [
      { title: 'Mở quản lý thẻ', description: 'Chọn tài khoản nguồn.' },
      { title: 'Đặt hạn mức', description: 'Tùy chỉnh hạn mức ngày và online.' },
      { title: 'Thanh toán', description: 'Dùng thông tin thẻ ảo cho giao dịch trực tuyến.' },
    ],
    conditions: ['Cần xác thực trước khi xem thông tin thẻ.', 'Một số tính năng phát hành thẻ phụ thuộc API đối tác.'],
  },
  {
    id: 'voucher',
    section: 'offer',
    title: 'Ưu đãi hóa đơn',
    subtitle: 'Giảm phí khi thanh toán điện, nước và internet.',
    description: 'Lưu voucher để áp dụng khi thanh toán hóa đơn đủ điều kiện trong Identra Pay.',
    badge: 'Voucher',
    actionLabel: 'Thanh toán hóa đơn',
    actionTarget: 'bill',
    gradient: ['#FFF1DF', '#FFD8A8'],
    icon: Percent,
    color: '#F28A1A',
    background: '#FFF1DF',
    reward: 'Giảm tới 30.000 VND',
    validUntil: '31/07/2026',
    benefits: ['Áp dụng cho điện, nước và internet.', 'Gợi ý voucher trong màn hóa đơn.', 'Theo dõi khoản giảm trong biên lai.'],
    steps: [
      { title: 'Lưu voucher', description: 'Kích hoạt ưu đãi cho tài khoản.' },
      { title: 'Tra cứu hóa đơn', description: 'Nhập mã khách hàng hoặc dùng mã đã lưu.' },
      { title: 'Thanh toán', description: 'Ưu đãi được áp dụng khi đủ điều kiện.' },
    ],
    conditions: ['Mỗi hóa đơn chỉ áp dụng một voucher.', 'Không áp dụng cho hóa đơn đã quá hạn trong demo.'],
  },
];

export function getPaymentExploreDetail(section?: string | string[], itemId?: string | string[]) {
  const normalizedSection = Array.isArray(section) ? section[0] : section;
  const normalizedId = Array.isArray(itemId) ? itemId[0] : itemId;
  return (
    paymentExploreDetails.find((item) => item.section === normalizedSection && item.id === normalizedId) ??
    paymentExploreDetails.find((item) => item.id === normalizedId) ??
    paymentExploreDetails[0]
  );
}
