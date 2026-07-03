import type { LucideIcon } from 'lucide-react-native';
import type { ImageSourcePropType } from 'react-native';

export type GradientColors = [string, string, ...string[]];

export interface PaymentCard {
  id: string;
  brand: string;
  gradient: GradientColors;
  cardNumber: string;
  accountNumber: string;
  accountType: string;
  expiry: string;
  holder: string;
  balanceLabel: string;
  balance: string;
  currency: string;
  dailyLimit: string;
  onlineLimit: string;
  statementDate: string;
  status: string;
}

export interface PaymentAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
}
