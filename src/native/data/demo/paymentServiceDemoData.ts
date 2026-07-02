import {
  Building2,
  Droplets,
  GraduationCap,
  Home,
  Smartphone,
  Tv,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

export interface MobileCarrier {
  id: string;
  name: string;
  shortName: string;
  color: string;
  background: string;
  bonus: string;
}

export interface TopupContact {
  id: string;
  name: string;
  phone: string;
  carrierId: string;
}

export interface TopupAmount {
  id: string;
  value: number;
  bonus: string;
  popular?: boolean;
}

export interface BillCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
  providers: string[];
  customerCodePlaceholder: string;
  savedCode: string;
  sampleBill: {
    customerName: string;
    address: string;
    period: string;
    dueDate: string;
    amount: number;
    fee: number;
  };
}

export const mobileCarriers: MobileCarrier[] = [
  { id: 'viettel', name: 'Viettel', shortName: 'VT', color: '#16A34A', background: '#EAFDF4', bonus: '+3%' },
  { id: 'vinaphone', name: 'Vinaphone', shortName: 'VN', color: '#2563EB', background: '#EAF2FF', bonus: '+2%' },
  { id: 'mobifone', name: 'Mobifone', shortName: 'MB', color: '#7C3AED', background: '#F2ECFF', bonus: '+2%' },
];

export const topupContacts: TopupContact[] = [
  { id: 'self', name: 'Số của tôi', phone: '038 294 8210', carrierId: 'viettel' },
  { id: 'mom', name: 'Mẹ', phone: '091 240 8821', carrierId: 'vinaphone' },
  { id: 'team', name: 'Nhóm dự án', phone: '090 881 2049', carrierId: 'mobifone' },
];

export const topupAmounts: TopupAmount[] = [
  { id: '50k', value: 50_000, bonus: '+1.500đ' },
  { id: '100k', value: 100_000, bonus: '+3.000đ', popular: true },
  { id: '200k', value: 200_000, bonus: '+6.000đ' },
  { id: '500k', value: 500_000, bonus: '+15.000đ' },
];

export const billCategories: BillCategory[] = [
  {
    id: 'electric',
    label: 'Điện',
    icon: Zap,
    color: '#F59E0B',
    background: '#FFF7ED',
    providers: ['EVN Hà Nội', 'EVN TP.HCM', 'EVN Miền Trung'],
    customerCodePlaceholder: 'Ví dụ: PE0102884739',
    savedCode: 'PE0102884739',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Cầu Giấy, Hà Nội',
      period: 'Tháng 06/2026',
      dueDate: '15/07/2026',
      amount: 684_000,
      fee: 0,
    },
  },
  {
    id: 'water',
    label: 'Nước',
    icon: Droplets,
    color: '#2563EB',
    background: '#EAF2FF',
    providers: ['Nước sạch Hà Nội', 'Sawaco', 'Dawaco'],
    customerCodePlaceholder: 'Ví dụ: NW772451008',
    savedCode: 'NW772451008',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Cầu Giấy, Hà Nội',
      period: 'Tháng 06/2026',
      dueDate: '18/07/2026',
      amount: 126_000,
      fee: 0,
    },
  },
  {
    id: 'internet',
    label: 'Internet',
    icon: Wifi,
    color: '#7C3AED',
    background: '#F2ECFF',
    providers: ['FPT Telecom', 'VNPT Fiber', 'Viettel Internet'],
    customerCodePlaceholder: 'Ví dụ: FT884739',
    savedCode: 'FT884739',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Gói Fiber Home',
      period: 'Tháng 07/2026',
      dueDate: '20/07/2026',
      amount: 245_000,
      fee: 0,
    },
  },
  {
    id: 'tuition',
    label: 'Học phí',
    icon: GraduationCap,
    color: '#DB2777',
    background: '#FFEAF0',
    providers: ['Đại học Identra', 'Trường Quốc tế Alpha', 'EduPay'],
    customerCodePlaceholder: 'Ví dụ: EDU20261028',
    savedCode: 'EDU20261028',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Học kỳ mùa hè 2026',
      period: 'Kỳ 07/2026',
      dueDate: '25/07/2026',
      amount: 3_850_000,
      fee: 5_000,
    },
  },
  {
    id: 'tv',
    label: 'Truyền hình',
    icon: Tv,
    color: '#EA580C',
    background: '#FFF1DF',
    providers: ['K+ TV', 'SCTV', 'VTVCab'],
    customerCodePlaceholder: 'Ví dụ: TV102884',
    savedCode: 'TV102884',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Gói giải trí gia đình',
      period: 'Tháng 07/2026',
      dueDate: '22/07/2026',
      amount: 159_000,
      fee: 0,
    },
  },
  {
    id: 'apartment',
    label: 'Chung cư',
    icon: Home,
    color: '#0F766E',
    background: '#E5FAF5',
    providers: ['Identra Residence', 'CityHome', 'UrbanPay'],
    customerCodePlaceholder: 'Ví dụ: A1208HOME',
    savedCode: 'A1208HOME',
    sampleBill: {
      customerName: 'NGUYEN HOANG NAM',
      address: 'Căn hộ A1208',
      period: 'Tháng 07/2026',
      dueDate: '28/07/2026',
      amount: 1_240_000,
      fee: 3_000,
    },
  },
];

export const billShortcuts = [
  { id: 'phone', label: 'Nạp điện thoại', icon: Smartphone, color: '#7657F3', background: '#F1ECFF' },
  { id: 'office', label: 'Văn phòng', icon: Building2, color: '#335CFF', background: '#EEF2FF' },
];

export function getCarrierById(carrierId: string) {
  return mobileCarriers.find((carrier) => carrier.id === carrierId) ?? mobileCarriers[0];
}

export function getBillCategoryById(categoryId?: string | string[]) {
  const normalizedId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  return billCategories.find((category) => category.id === normalizedId) ?? billCategories[0];
}
