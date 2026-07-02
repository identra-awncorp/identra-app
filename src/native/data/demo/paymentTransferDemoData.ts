import { Building2, Store, UserRound } from 'lucide-react-native';

export interface TransferRecipient {
  id: string;
  name: string;
  account: string;
  bank: string;
  initials: string;
  color: string;
  background: string;
  recent: string;
  verified: boolean;
  icon: typeof UserRound;
}

export const transferRecipients: TransferRecipient[] = [
  {
    id: 'minh-anh',
    name: 'Nguyen Minh Anh',
    account: 'idpay:minhanh',
    bank: 'IDPay',
    initials: 'MA',
    color: '#335CFF',
    background: '#EEF2FF',
    recent: 'Vừa chuyển hôm qua',
    verified: true,
    icon: UserRound,
  },
  {
    id: 'lan-store',
    name: 'Lan Coffee Store',
    account: '9704 2688 9012 4421',
    bank: 'Identra Business',
    initials: 'LC',
    color: '#13A06D',
    background: '#E9FAF2',
    recent: 'Thanh toán thường xuyên',
    verified: true,
    icon: Store,
  },
  {
    id: 'tuition',
    name: 'Truong Dai hoc Identra',
    account: '101 337 900 441',
    bank: 'VietQR Partner',
    initials: 'ID',
    color: '#8563E9',
    background: '#F2ECFF',
    recent: 'Học phí kỳ trước',
    verified: true,
    icon: Building2,
  },
];

export function getTransferRecipientById(recipientId?: string | string[]) {
  const normalizedId = Array.isArray(recipientId) ? recipientId[0] : recipientId;
  return transferRecipients.find((recipient) => recipient.id === normalizedId) ?? transferRecipients[0];
}
