import type { BillCategory } from '../../data/demo/paymentServiceDemoData';

export interface PaymentBillPreview {
  customerName: string;
  address: string;
  period: string;
  dueDate: string;
  amount: number;
  fee: number;
  customerCode: string;
  label: string;
  provider: string;
}

export interface PaymentServiceReceipt {
  id: string;
  title: string;
  amount: number;
  fee: number;
  total: number;
  target: string;
  description: string;
  source: string;
  time: string;
}

export type PhoneTopUpValidationReason = 'missing_phone';
export type BillLookupValidationReason = 'missing_customer_code';
export type BillPaymentValidationReason = 'missing_bill';

export type PaymentValidationResult<Reason extends string> =
  | { ok: true }
  | { ok: false; reason: Reason };

export function normalizePaymentPhone(value: string) {
  return value.replace(/\D/g, '');
}

export function validatePhoneTopUpDraft({
  phoneNumber,
}: {
  phoneNumber: string;
}): PaymentValidationResult<PhoneTopUpValidationReason> {
  return normalizePaymentPhone(phoneNumber).length >= 9
    ? { ok: true }
    : { ok: false, reason: 'missing_phone' };
}

export function validateBillLookupDraft({
  customerCode,
}: {
  customerCode: string;
}): PaymentValidationResult<BillLookupValidationReason> {
  return customerCode.trim().length >= 5
    ? { ok: true }
    : { ok: false, reason: 'missing_customer_code' };
}

export function validateBillPaymentDraft({
  bill,
}: {
  bill: PaymentBillPreview | null;
}): PaymentValidationResult<BillPaymentValidationReason> {
  return bill ? { ok: true } : { ok: false, reason: 'missing_bill' };
}

export function createBillPreview(category: BillCategory, providerIndex: number, customerCode: string): PaymentBillPreview {
  return {
    ...category.sampleBill,
    customerCode,
    label: category.label,
    provider: category.providers[providerIndex] ?? category.providers[0],
  };
}

export function lookupBillPreview({
  category,
  customerCode,
  providerIndex,
}: {
  category: BillCategory;
  customerCode: string;
  providerIndex: number;
}): { ok: true; bill: PaymentBillPreview } | { ok: false; reason: BillLookupValidationReason } {
  const validation = validateBillLookupDraft({ customerCode });

  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    bill: createBillPreview(category, providerIndex, customerCode.trim()),
  };
}

export function createServiceReceipt({
  amount,
  createdAt = new Date(),
  description,
  fee,
  source,
  target,
  title,
}: {
  amount: number;
  createdAt?: Date;
  description: string;
  fee: number;
  source: string;
  target: string;
  title: string;
}): PaymentServiceReceipt {
  return {
    id: `IDP${createdAt.getTime().toString().slice(-8)}`,
    title,
    amount,
    fee,
    total: amount + fee,
    target,
    description,
    source,
    time: formatReceiptTime(createdAt),
  };
}

function formatReceiptTime(value: Date) {
  return `${value.toLocaleDateString('vi-VN')} ${value.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}
