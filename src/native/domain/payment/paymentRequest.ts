export type PaymentRequestFailureReason = 'api_fail' | 'duplicate_submit' | 'insufficient_balance' | 'timeout';

export type PaymentRequestState =
  | { status: 'idle' }
  | { duplicateBlocked?: boolean; status: 'loading' }
  | { reason: PaymentRequestFailureReason; status: 'failed' };

export type PaymentRequestResult<T> =
  | { data: T; ok: true }
  | { ok: false; reason: PaymentRequestFailureReason };

const DEFAULT_PAYMENT_TIMEOUT_MS = 8000;

class PaymentRequestTimeoutError extends Error {
  constructor() {
    super('Payment request timed out');
    this.name = 'PaymentRequestTimeoutError';
  }
}

export function createIdlePaymentRequestState(): PaymentRequestState {
  return { status: 'idle' };
}

export function createLoadingPaymentRequestState(duplicateBlocked = false): PaymentRequestState {
  return duplicateBlocked ? { status: 'loading', duplicateBlocked } : { status: 'loading' };
}

export function createFailedPaymentRequestState(reason: PaymentRequestFailureReason): PaymentRequestState {
  return { status: 'failed', reason };
}

export function isPaymentRequestLoading(state: PaymentRequestState) {
  return state.status === 'loading';
}

export function parsePaymentBalance(value: string) {
  return Number(value.replace(/[^\d]/g, '')) || 0;
}

export async function runPaymentRequest<T>({
  amount,
  availableBalance,
  operation,
  timeoutMs = DEFAULT_PAYMENT_TIMEOUT_MS,
}: {
  amount: number;
  availableBalance: number;
  operation: () => Promise<T>;
  timeoutMs?: number;
}): Promise<PaymentRequestResult<T>> {
  if (amount > availableBalance) {
    return { ok: false, reason: 'insufficient_balance' };
  }

  try {
    const data = await withTimeout(operation(), timeoutMs);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, reason: error instanceof PaymentRequestTimeoutError ? 'timeout' : 'api_fail' };
  }
}

export function waitForPaymentRequest(ms = 650) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new PaymentRequestTimeoutError()), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
