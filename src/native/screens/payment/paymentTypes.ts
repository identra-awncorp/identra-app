import type { LucideIcon } from 'lucide-react-native';

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

export interface PromoBanner {
  id: string;
  title: string;
  description: string;
  action: string;
  gradient: GradientColors;
  icon: LucideIcon;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  gradient: GradientColors;
  icon: LucideIcon;
}
