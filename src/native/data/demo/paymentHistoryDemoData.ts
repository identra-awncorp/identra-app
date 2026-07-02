import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgePercent,
  CreditCard,
  ReceiptText,
  Smartphone,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';

export type PaymentTransactionDirection = 'in' | 'out';
export type PaymentTransactionStatus = 'success' | 'pending' | 'failed';
export type PaymentTransactionCategory = 'transfer' | 'receive' | 'topup' | 'bill' | 'reward' | 'card';

export interface PaymentTransaction {
  id: string;
  title: string;
  counterparty: string;
  description: string;
  amount: number;
  fee: number;
  currency: string;
  direction: PaymentTransactionDirection;
  status: PaymentTransactionStatus;
  category: PaymentTransactionCategory;
  dateLabel: string;
  time: string;
  sourceAccount: string;
  reference: string;
  channel: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

export const paymentTransactions: PaymentTransaction[] = [
  {
    id: 'txn-250702-001',
    title: 'Thanh toán hóa đơn điện',
    counterparty: 'EVN Hà Nội',
    description: 'Tháng 06/2026 · PE0102884739',
    amount: 684_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'success',
    category: 'bill',
    dateLabel: 'Hôm nay · 02/07/2026',
    time: '14:08',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25070201',
    channel: 'Identra Pay',
    icon: ReceiptText,
    color: '#F28A1A',
    background: '#FFF1DF',
  },
  {
    id: 'txn-250702-002',
    title: 'Nhận tiền',
    counterparty: 'Minh Anh',
    description: 'IDPay · Chuyen tien an trua',
    amount: 1_200_000,
    fee: 0,
    currency: 'VND',
    direction: 'in',
    status: 'success',
    category: 'receive',
    dateLabel: 'Hôm nay · 02/07/2026',
    time: '09:42',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25070202',
    channel: 'IDPay QR',
    icon: ArrowDownLeft,
    color: '#12B76A',
    background: '#EAFDF4',
  },
  {
    id: 'txn-250701-001',
    title: 'Nạp điện thoại',
    counterparty: 'Viettel',
    description: '038 294 8210 · +3.000đ',
    amount: 100_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'success',
    category: 'topup',
    dateLabel: 'Hôm qua · 01/07/2026',
    time: '20:15',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25070111',
    channel: 'Mobile Topup',
    icon: Smartphone,
    color: '#7657F3',
    background: '#F1ECFF',
  },
  {
    id: 'txn-250701-002',
    title: 'Chuyển tiền',
    counterparty: 'Linh Tran',
    description: 'TPBank · Mua tài liệu học',
    amount: 450_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'success',
    category: 'transfer',
    dateLabel: 'Hôm qua · 01/07/2026',
    time: '12:04',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25070108',
    channel: 'Chuyển khoản nhanh',
    icon: ArrowUpRight,
    color: '#3F58FF',
    background: '#EEF2FF',
  },
  {
    id: 'txn-250630-001',
    title: 'Hoàn tiền ưu đãi',
    counterparty: 'Identra Rewards',
    description: 'Hoàn tiền thanh toán cuối tuần',
    amount: 49_000,
    fee: 0,
    currency: 'VND',
    direction: 'in',
    status: 'success',
    category: 'reward',
    dateLabel: '30/06/2026',
    time: '18:30',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25063031',
    channel: 'Rewards',
    icon: BadgePercent,
    color: '#E78318',
    background: '#FFF3E5',
  },
  {
    id: 'txn-250629-001',
    title: 'Thanh toán thẻ',
    counterparty: 'Cửa hàng tiện lợi',
    description: 'VISA **** 3456',
    amount: 245_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'success',
    category: 'card',
    dateLabel: '29/06/2026',
    time: '21:18',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25062942',
    channel: 'Card POS',
    icon: CreditCard,
    color: '#2187C7',
    background: '#E8F6FF',
  },
  {
    id: 'txn-250628-001',
    title: 'Thanh toán internet',
    counterparty: 'FPT Telecom',
    description: 'FT884739 · Tháng 07/2026',
    amount: 245_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'pending',
    category: 'bill',
    dateLabel: '28/06/2026',
    time: '10:22',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25062820',
    channel: 'Hóa đơn',
    icon: ReceiptText,
    color: '#7C3AED',
    background: '#F2ECFF',
  },
  {
    id: 'txn-250627-001',
    title: 'Chuyển tiền không thành công',
    counterparty: 'Tài khoản mới',
    description: 'Sai thông tin người nhận',
    amount: 2_000_000,
    fee: 0,
    currency: 'VND',
    direction: 'out',
    status: 'failed',
    category: 'transfer',
    dateLabel: '27/06/2026',
    time: '16:03',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25062715',
    channel: 'Chuyển khoản nhanh',
    icon: XCircle,
    color: '#FF3D47',
    background: '#FFF0F1',
  },
  {
    id: 'txn-250626-001',
    title: 'Nhận hoàn ứng',
    counterparty: 'Công ty Alpha',
    description: 'Hoàn ứng chi phí công tác',
    amount: 3_800_000,
    fee: 0,
    currency: 'VND',
    direction: 'in',
    status: 'success',
    category: 'receive',
    dateLabel: '26/06/2026',
    time: '08:55',
    sourceAccount: 'IDPAY 102 884 739',
    reference: 'IDP25062609',
    channel: 'IDPay Transfer',
    icon: Wallet,
    color: '#12B76A',
    background: '#EAFDF4',
  },
];

export function getPaymentTransactionById(transactionId?: string | string[]) {
  const normalizedId = Array.isArray(transactionId) ? transactionId[0] : transactionId;
  return paymentTransactions.find((transaction) => transaction.id === normalizedId) ?? paymentTransactions[0];
}

export function getHistorySummary() {
  return paymentTransactions.reduce(
    (summary, transaction) => {
      if (transaction.status !== 'success') return summary;

      if (transaction.direction === 'in') {
        summary.income += transaction.amount;
      } else {
        summary.outcome += transaction.amount + transaction.fee;
      }

      return summary;
    },
    { income: 0, outcome: 0 },
  );
}
