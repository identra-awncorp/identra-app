export type PaymentUnit = 'VND' | 'Plan A';

export type TransferDraft = {
  amount: number;
  note: string;
  unit: PaymentUnit;
};

export const IDPAY_BALANCES: Record<PaymentUnit, number> = {
  VND: 2_500_000,
  'Plan A': 850,
};

export function parseRawAmount(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export function formatAmount(value: number): string {
  return value > 0 ? value.toLocaleString('vi-VN') : '';
}
