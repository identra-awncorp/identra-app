// State machines of the receive, detail and restore screens. Pure reducers: screens dispatch the
// SDK results they get and render the state. The PIN is never part of any state here.
import type { AcceptResult, CredentialDetails, ResolvedOffer, WalletFailure } from '@identra/sdk-app';
import type { Check } from '@identra/sdk-core';

import { failureView, type FailureCode, type FailureView } from './walletMessages';
import type { WalletStartupState } from './walletContainer';

/** A wallet failure, or one the app produced from a thrown error (SecretStorageError codes). */
export type Failed = WalletFailure | { ok: false; code: FailureCode; checks?: Check[] };

// ---------------------------------------------------------------- receive (OpenID4VCI)

export type ReceiveState =
  | { phase: 'resolving' }
  /** The code could not be opened; nothing was created. */
  | { phase: 'resolve-failed'; failure: FailureView }
  /** Who offers what, PIN entry. `failure`: the last attempt failed in a way this screen can retry. */
  | { phase: 'consent'; offer: ResolvedOffer; failure: FailureView | null; attempt: number }
  | { phase: 'accepting'; offer: ResolvedOffer; attempt: number }
  | { phase: 'received'; credentialId: string; vct: string; issuerName: string }
  /** Final: nothing was saved; the person needs a new code or the issuer. */
  | { phase: 'accept-failed'; failure: FailureView; issuerUri: string };

export type ReceiveEvent =
  | { type: 'resolved'; result: { ok: true; offer: ResolvedOffer } | WalletFailure }
  | { type: 'submit' }
  | { type: 'accepted'; result: AcceptResult }
  | { type: 'accept-threw'; code: FailureCode }
  | { type: 'retry-resolve' };

export const initialReceiveState: ReceiveState = { phase: 'resolving' };

/** Accept failures after which the same resolved offer can be tried again from the consent screen. */
const RETRY_ON_CONSENT: ReadonlySet<FailureCode> = new Set(['TX_CODE_WRONG', 'NETWORK_ERROR', 'STORAGE_ERROR', 'USER_CANCELLED', 'DEVICE_LOCKED']);

export function receiveReducer(state: ReceiveState, event: ReceiveEvent): ReceiveState {
  switch (event.type) {
    case 'resolved':
      if (state.phase !== 'resolving') return state;
      return event.result.ok
        ? { phase: 'consent', offer: event.result.offer, failure: null, attempt: 0 }
        : { phase: 'resolve-failed', failure: failureView(event.result.code, event.result.checks) };
    case 'retry-resolve':
      return state.phase === 'resolve-failed' ? initialReceiveState : state;
    case 'submit':
      return state.phase === 'consent' ? { phase: 'accepting', offer: state.offer, attempt: state.attempt + 1 } : state;
    case 'accepted':
    case 'accept-threw': {
      if (state.phase !== 'accepting') return state;
      if (event.type === 'accepted' && event.result.ok) {
        return { phase: 'received', credentialId: event.result.credentialId, vct: event.result.vct, issuerName: event.result.issuerName };
      }
      const code: FailureCode = event.type === 'accepted' ? (event.result as WalletFailure).code : event.code;
      const checks: Check[] | undefined = event.type === 'accepted' ? (event.result as WalletFailure).checks : undefined;
      const failure = failureView(code, checks);
      return RETRY_ON_CONSENT.has(failure.code)
        ? { phase: 'consent', offer: state.offer, failure, attempt: state.attempt }
        : { phase: 'accept-failed', failure, issuerUri: state.offer.issuerUri };
    }
  }
}

/** The PIN field must be emptied after this transition (wrong PIN): the component owns the PIN. */
export function shouldClearPin(previous: ReceiveState, next: ReceiveState): boolean {
  return previous.phase === 'accepting' && next.phase === 'consent' && next.failure?.code === 'TX_CODE_WRONG';
}

// ---------------------------------------------------------------- credential detail

export type DetailState =
  | { phase: 'loading' }
  | { phase: 'failed'; failure: FailureView }
  | { phase: 'loaded'; details: CredentialDetails; refreshing: boolean; refreshFailure: FailureView | null; removing: boolean; removeFailure: FailureView | null }
  | { phase: 'removed' };

export type DetailEvent =
  | { type: 'loaded'; result: { ok: true; credential: CredentialDetails } | Failed }
  | { type: 'refresh' }
  | { type: 'refreshed'; result: { ok: true; status: CredentialDetails['status'] } | Failed; checkedAt: string }
  | { type: 'remove' }
  | { type: 'removed'; result: { ok: true } | Failed }
  | { type: 'failed'; code: FailureCode };

export const initialDetailState: DetailState = { phase: 'loading' };

export function detailReducer(state: DetailState, event: DetailEvent): DetailState {
  switch (event.type) {
    case 'loaded':
      return event.result.ok
        ? { phase: 'loaded', details: event.result.credential, refreshing: false, refreshFailure: null, removing: false, removeFailure: null }
        : { phase: 'failed', failure: failureView(event.result.code) };
    case 'failed':
      return { phase: 'failed', failure: failureView(event.code) };
    case 'refresh':
      return state.phase === 'loaded' && !state.refreshing && !state.removing ? { ...state, refreshing: true, refreshFailure: null } : state;
    case 'refreshed':
      if (state.phase !== 'loaded' || !state.refreshing) return state;
      return event.result.ok
        ? { ...state, refreshing: false, details: { ...state.details, status: event.result.status, statusCheckedAt: event.checkedAt } }
        : { ...state, refreshing: false, refreshFailure: failureView(event.result.code) };
    case 'remove':
      return state.phase === 'loaded' && !state.removing ? { ...state, removing: true, removeFailure: null } : state;
    case 'removed':
      if (state.phase !== 'loaded' || !state.removing) return state;
      return event.result.ok ? { phase: 'removed' } : { ...state, removing: false, removeFailure: failureView(event.result.code) };
  }
}

// ---------------------------------------------------------------- restore (ADR-0009 §5)

export type RestoreState =
  | { phase: 'loading' }
  | { phase: 'failed'; failure: FailureView }
  /** Rows without their device-only key: the person must confirm before they are cleared. */
  | { phase: 'restored-device'; items: WalletStartupState['toRequest']; unreadableCount: number; confirming: boolean; failure: FailureView | null }
  /** A list of documents to request again (fresh install with a backed-up catalogue), or empty. */
  | { phase: 'to-request'; items: WalletStartupState['toRequest']; justCleared: boolean };

export type RestoreEvent =
  | { type: 'loaded'; startup: WalletStartupState }
  | { type: 'load-failed'; code: FailureCode }
  | { type: 'confirm' }
  | { type: 'confirmed' }
  | { type: 'confirm-failed'; code: FailureCode }
  | { type: 'forgotten'; key: string };

export const initialRestoreState: RestoreState = { phase: 'loading' };
const itemKey = (i: { vct: string; issuer: string }) => JSON.stringify([i.vct, i.issuer]);

export function restoreReducer(state: RestoreState, event: RestoreEvent): RestoreState {
  switch (event.type) {
    case 'loaded':
      return event.startup.kind === 'restored-device'
        ? { phase: 'restored-device', items: event.startup.toRequest, unreadableCount: event.startup.unreadableCount, confirming: false, failure: null }
        : { phase: 'to-request', items: event.startup.toRequest, justCleared: false };
    case 'load-failed':
      return { phase: 'failed', failure: failureView(event.code) };
    case 'confirm':
      return state.phase === 'restored-device' && !state.confirming ? { ...state, confirming: true, failure: null } : state;
    case 'confirmed':
      return state.phase === 'restored-device' && state.confirming ? { phase: 'to-request', items: state.items, justCleared: true } : state;
    case 'confirm-failed':
      return state.phase === 'restored-device' && state.confirming ? { ...state, confirming: false, failure: failureView(event.code) } : state;
    case 'forgotten':
      return state.phase === 'to-request' ? { ...state, items: state.items.filter((i) => itemKey(i) !== event.key) } : state;
  }
}
