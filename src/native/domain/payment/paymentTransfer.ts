import type { TransferRecipient } from '../../data/demo/paymentTransferDemoData';

export type TransferReceiptStatus = 'success' | 'pending' | 'failed';

export interface TransferReceipt {
  id: string;
  amount: number;
  currency: string;
  fee: number;
  note: string;
  recipient: TransferRecipient;
  sourceName: string;
  sourceAccount: string;
  status: TransferReceiptStatus;
  time: string;
}

export type TransferValidationReason = 'insufficient_balance' | 'missing_amount';

export type TransferValidationResult =
  | { ok: true }
  | { ok: false; reason: TransferValidationReason };

export function parsePaymentRouteAmount(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ? Number(raw) || 0 : 0;
}

export function normalizePaymentRouteMemo(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function validateTransferAmount({
  amount,
  availableBalance,
}: {
  amount: number;
  availableBalance: number;
}): TransferValidationResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: 'missing_amount' };
  }

  if (amount > availableBalance) {
    return { ok: false, reason: 'insufficient_balance' };
  }

  return { ok: true };
}

export function createTransferReceipt({
  amount,
  createdAt = new Date(),
  note,
  recipient,
  sourceAccount,
  sourceName,
  status = 'success',
}: {
  amount: number;
  createdAt?: Date;
  note?: string | string[];
  recipient: TransferRecipient;
  sourceAccount: string;
  sourceName: string;
  status?: TransferReceiptStatus;
}): TransferReceipt {
  const normalizedNote = normalizePaymentRouteMemo(note);

  return {
    id: `IDP${createdAt.getTime().toString().slice(-8)}`,
    amount,
    currency: 'VND',
    fee: 0,
    note: normalizedNote?.trim() || 'Chuyen tien Identra Pay',
    recipient,
    sourceName,
    sourceAccount,
    status,
    time: formatReceiptTime(createdAt),
  };
}

function formatReceiptTime(value: Date) {
  return `${value.toLocaleDateString('vi-VN')} ${value.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}
