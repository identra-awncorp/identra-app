import {
  createFailedPaymentRequestState,
  createIdlePaymentRequestState,
  createLoadingPaymentRequestState,
  isPaymentRequestLoading,
  type PaymentRequestFailureReason,
  type PaymentRequestState,
} from './paymentRequest';

export type PaymentAuthSheetStatus = 'closed' | 'open';

export interface PaymentAuthState {
  status: PaymentAuthSheetStatus;
  request: PaymentRequestState;
}

export function createClosedPaymentAuthState(): PaymentAuthState {
  return {
    status: 'closed',
    request: createIdlePaymentRequestState(),
  };
}

export function openPaymentAuthState(): PaymentAuthState {
  return {
    status: 'open',
    request: createIdlePaymentRequestState(),
  };
}

export function closePaymentAuthState(): PaymentAuthState {
  return createClosedPaymentAuthState();
}

export function markPaymentAuthLoading(state: PaymentAuthState): PaymentAuthState {
  return {
    ...state,
    status: 'open',
    request: createLoadingPaymentRequestState(),
  };
}

export function markPaymentAuthDuplicate(state: PaymentAuthState): PaymentAuthState {
  return {
    ...state,
    status: 'open',
    request: createLoadingPaymentRequestState(true),
  };
}

export function markPaymentAuthFailed(state: PaymentAuthState, reason: PaymentRequestFailureReason): PaymentAuthState {
  return {
    ...state,
    status: 'open',
    request: createFailedPaymentRequestState(reason),
  };
}

export function isPaymentAuthOpen(state: PaymentAuthState) {
  return state.status === 'open';
}

export function isPaymentAuthLoading(state: PaymentAuthState) {
  return isPaymentRequestLoading(state.request);
}

export function canClosePaymentAuth(state: PaymentAuthState) {
  return !isPaymentAuthLoading(state);
}
