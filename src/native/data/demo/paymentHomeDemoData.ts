import {
  BadgePercent,
  Banknote,
  BriefcaseBusiness,
  Car,
  ChartCandlestick,
  CreditCard,
  Droplets,
  Download,
  Gift,
  HandCoins,
  History,
  Landmark,
  Percent,
  QrCode,
  ReceiptText,
  Scissors,
  Send,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react-native';

import type { Offer, PaymentAction, PaymentCard, PromoBanner } from '../../screens/payment/paymentTypes';

export const paymentCards: PaymentCard[] = [
  {
    id: 'main-card',
    brand: 'VISA',
    gradient: ['#07167D', '#004DFF', '#0628B9'],
    cardNumber: '4242 5678 9012 3456',
    accountNumber: 'IDPAY 102 884 739',
    accountType: 'Tài khoản thanh toán',
    expiry: '12/27',
    holder: 'NGUYEN HOANG NAM',
    balanceLabel: 'Số dư',
    balance: '128,450,000',
    currency: 'VND',
    dailyLimit: '50,000,000 VND',
    onlineLimit: '20,000,000 VND',
    statementDate: 'Ngày 25 hằng tháng',
    status: 'Đang hoạt động',
  },
  {
    id: 'savings-card',
    brand: 'IDPAY',
    gradient: ['#063D59', '#00A6D6', '#3867FF'],
    cardNumber: '6888 1204 9018 2206',
    accountNumber: 'IDPAY 772 451 008',
    accountType: 'Tài khoản tiết kiệm',
    expiry: '09/28',
    holder: 'NGUYEN HOANG NAM',
    balanceLabel: 'Tài khoản tiết kiệm',
    balance: '46,880,000',
    currency: 'VND',
    dailyLimit: '30,000,000 VND',
    onlineLimit: '10,000,000 VND',
    statementDate: 'Ngày 01 hằng tháng',
    status: 'Đang hoạt động',
  },
];

export function getPaymentCardById(cardId?: string | string[]) {
  const normalizedId = Array.isArray(cardId) ? cardId[0] : cardId;
  return paymentCards.find((card) => card.id === normalizedId) ?? paymentCards[0];
}

export const quickActions: PaymentAction[] = [
  { id: 'transfer', label: 'Chuyển tiền', icon: Send, color: '#3F58FF', background: '#EEF2FF' },
  { id: 'receive', label: 'Nhận tiền', icon: Download, color: '#20A868', background: '#EAFDF4' },
  { id: 'phone', label: 'Nạp tiền điện thoại', icon: Smartphone, color: '#7657F3', background: '#F1ECFF' },
  { id: 'bill', label: 'Thanh toán hóa đơn', icon: ReceiptText, color: '#F28A1A', background: '#FFF1DF' },
  { id: 'withdraw', label: 'Rút tiền', icon: Banknote, color: '#2187C7', background: '#E8F6FF' },
  { id: 'history', label: 'Lịch sử', icon: History, color: '#6046EA', background: '#F0EDFF' },
  { id: 'split', label: 'Chia hóa đơn', icon: Scissors, color: '#E6537B', background: '#FFEAF0' },
  { id: 'utilities', label: 'Điện nước', icon: Droplets, color: '#3979F6', background: '#EAF2FF' },
  { id: 'qr', label: 'Quét mã QR', icon: QrCode, color: '#0E9F86', background: '#E5FAF5' },
  { id: 'wallet', label: 'Ví IDPay', icon: Wallet, color: '#4657D9', background: '#EEF1FF' },
];

export const suggestionActions: PaymentAction[] = [
  { id: 'business', label: 'Mở tài khoản kinh doanh', icon: BriefcaseBusiness, color: '#335CFF', background: '#EEF2FF' },
  { id: 'traffic', label: 'Tra cứu phạt nguội', icon: Car, color: '#F06445', background: '#FFF0EC' },
  { id: 'stocks', label: 'Chứng khoán', icon: ChartCandlestick, color: '#13A06D', background: '#E9FAF2' },
  { id: 'saving', label: 'Tiết kiệm', icon: Landmark, color: '#8563E9', background: '#F2ECFF' },
  { id: 'rewards', label: 'Hoàn tiền', icon: Gift, color: '#E78318', background: '#FFF3E5' },
  { id: 'insurance', label: 'Bảo hiểm', icon: ShieldCheck, color: '#2C7BE5', background: '#EAF3FF' },
];

export const promoBanners: PromoBanner[] = [
  {
    id: 'cashback',
    title: 'Thanh toán dễ dàng',
    description: 'Hoàn tiền mỗi ngày khi chi tiêu qua Identra Pay.',
    action: 'Khám phá ngay',
    gradient: ['#EEF2FF', '#D8E1FF', '#F2F7FF'],
    icon: Gift,
  },
  {
    id: 'security',
    title: 'Bảo vệ mọi giao dịch',
    description: 'Xác thực nhanh, cảnh báo tức thì và kiểm soát thẻ ngay trong app.',
    action: 'Quản lý bảo mật',
    gradient: ['#EAFDF4', '#D9F4FF', '#EEF2FF'],
    icon: ShieldCheck,
  },
];

export const paymentOffers: Offer[] = [
  {
    id: 'shopping',
    title: 'Hoàn tiền 20%',
    description: 'Khi mua sắm cuối tuần bằng Identra Pay.',
    gradient: ['#EAF2FF', '#C7D7FF'],
    icon: BadgePercent,
  },
  {
    id: 'saving',
    title: 'Gửi góp linh hoạt',
    description: 'Tạo mục tiêu tiết kiệm chỉ trong vài chạm.',
    gradient: ['#EAFDF4', '#C8F1DE'],
    icon: HandCoins,
  },
  {
    id: 'card',
    title: 'Thẻ ảo miễn phí',
    description: 'Tách ngân sách riêng cho mua sắm online.',
    gradient: ['#F2ECFF', '#D9CAFF'],
    icon: CreditCard,
  },
  {
    id: 'voucher',
    title: 'Ưu đãi hóa đơn',
    description: 'Giảm phí khi thanh toán điện, nước và internet.',
    gradient: ['#FFF1DF', '#FFD8A8'],
    icon: Percent,
  },
];
