// State machines of the receive, detail and restore screens. Pure reducers: screens dispatch the
// SDK results they get and render the state. The PIN is never part of any state here.
import type { AcceptResult, CredentialDetails, ResolvedOffer, WalletFailure } from '@identra/sdk-app';
import type { Check } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import { failureView, type FailureCode, type FailureView } from './walletMessages';
import type { WalletStartupState } from './walletContainer';

/** A wallet failure, or one the app produced from a thrown error (SecretStorageError codes). */
export type Failed = WalletFailure | { ok: false; code: FailureCode; checks?: Check[] };

// ---------------------------------------------------------------- receive (OpenID4VCI)

export type ReceiveState =
  /** Before anything else: can this phone keep a biometric-protected key? (no code is spent yet) */
  | { phase: 'checking-device' }
  | { phase: 'device-not-ready' }
  | { phase: 'resolving' }
  /** The code could not be opened; nothing was created. */
  | { phase: 'resolve-failed'; failure: FailureView }
  /** Who offers what, PIN entry. `failure`: only a wrong PIN comes back here (the code is not spent). */
  | { phase: 'consent'; offer: ResolvedOffer; failure: FailureView | null; attempt: number }
  /** The PIN was accepted and the SDK can resume (`retryable: true`): "Thử lại" without the PIN. */
  | { phase: 'resume'; offer: ResolvedOffer; failure: FailureView; attempt: number }
  | { phase: 'accepting'; offer: ResolvedOffer; attempt: number; resuming: boolean }
  /** `status`: `unknown` when the lists were unreachable at receipt (the SDK keeps the document). */
  | { phase: 'received'; credentialId: string; vct: string; issuerName: string | null; issuerUri: string; status: 'valid' | 'unknown' }
  /** Final: nothing was saved. `codeSpent`: the PIN was accepted, so this code cannot be used again. */
  | { phase: 'accept-failed'; failure: FailureView; issuerUri: string; codeSpent: boolean };

export type ReceiveEvent =
  | { type: 'device-checked'; ready: boolean }
  | { type: 'resolved'; result: { ok: true; offer: ResolvedOffer } | WalletFailure }
  | { type: 'submit' }
  | { type: 'accepted'; result: AcceptResult }
  | { type: 'accept-threw'; code: FailureCode }
  | { type: 'retry-resolve' };

export const initialReceiveState: ReceiveState = { phase: 'checking-device' };

/** Failures with their own sentence once the code is spent (the generic one could claim "nothing changed"). */
const AFTER_PIN_SENTENCES: Partial<Record<FailureCode, I18nKey>> = {
  USER_CANCELLED: 'wallet.receive.afterPin.USER_CANCELLED',
  DEVICE_LOCKED: 'wallet.receive.afterPin.DEVICE_LOCKED',
  NETWORK_ERROR: 'wallet.receive.afterPin.NETWORK_ERROR',
  STORAGE_ERROR: 'wallet.receive.afterPin.STORAGE_ERROR',
  KEY_INVALIDATED: 'wallet.receive.afterPin.STORAGE_ERROR',
};
/** The same failures when the SDK can resume: what happened, and that the PIN is not needed again. */
const RESUME_SENTENCES: Partial<Record<FailureCode, I18nKey>> = {
  USER_CANCELLED: 'wallet.receive.resume.USER_CANCELLED',
  DEVICE_LOCKED: 'wallet.receive.resume.DEVICE_LOCKED',
  NETWORK_ERROR: 'wallet.receive.resume.NETWORK_ERROR',
};

/** Codes the SDK returns before the one-time code is spent (the token request itself refused it). */
const BEFORE_PIN: ReadonlySet<FailureCode> = new Set(['TX_CODE_WRONG', 'OFFER_EXPIRED']);

function acceptFailure(state: Extract<ReceiveState, { phase: 'accepting' }>, code: FailureCode, checks: Check[] | undefined, retryable: unknown): ReceiveState {
  const base = failureView(code, checks);
  if (code === 'TX_CODE_WRONG' && !state.resuming) return { phase: 'consent', offer: state.offer, failure: base, attempt: state.attempt };
  // The SDK marks failures it can resume on the same offer (access token kept); until it does,
  // every failure after the PIN is final: the one-time code is spent.
  if (retryable === true) {
    return { phase: 'resume', offer: state.offer, attempt: state.attempt, failure: { ...base, action: 'retry', sentenceKey: RESUME_SENTENCES[code] ?? base.sentenceKey } };
  }
  const codeSpent = state.resuming || !BEFORE_PIN.has(code);
  const sentenceKey = codeSpent ? (AFTER_PIN_SENTENCES[code] ?? base.sentenceKey) : base.sentenceKey;
  return { phase: 'accept-failed', issuerUri: state.offer.issuerUri, codeSpent, failure: { ...base, sentenceKey, action: codeSpent ? 'contact-issuer' : base.action } };
}

export function receiveReducer(state: ReceiveState, event: ReceiveEvent): ReceiveState {
  switch (event.type) {
    case 'device-checked':
      if (state.phase !== 'checking-device') return state;
      return event.ready ? { phase: 'resolving' } : { phase: 'device-not-ready' };
    case 'resolved':
      if (state.phase !== 'resolving') return state;
      return event.result.ok
        ? { phase: 'consent', offer: event.result.offer, failure: null, attempt: 0 }
        : { phase: 'resolve-failed', failure: failureView(event.result.code, event.result.checks) };
    case 'retry-resolve':
      return state.phase === 'resolve-failed' ? { phase: 'resolving' } : state;
    case 'submit':
      if (state.phase === 'consent') return { phase: 'accepting', offer: state.offer, attempt: state.attempt + 1, resuming: false };
      if (state.phase === 'resume') return { phase: 'accepting', offer: state.offer, attempt: state.attempt + 1, resuming: true };
      return state;
    case 'accepted':
    case 'accept-threw': {
      if (state.phase !== 'accepting') return state;
      if (event.type === 'accepted' && event.result.ok) {
        // Read defensively: `status` is new in the SDK's accept result.
        const status = (event.result as { status?: unknown }).status === 'unknown' ? 'unknown' : 'valid';
        // issuerName is null when the trust list could not be read at receipt (status unknown).
        return { phase: 'received', credentialId: event.result.credentialId, vct: event.result.vct, issuerName: event.result.issuerName, issuerUri: state.offer.issuerUri, status };
      }
      if (event.type === 'accept-threw') return acceptFailure(state, event.code, undefined, false);
      const failed = event.result as WalletFailure & { retryable?: unknown };
      return acceptFailure(state, failed.code, failed.checks, failed.retryable);
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
  | {
      phase: 'loaded';
      details: CredentialDetails;
      refreshing: boolean;
      refreshFailure: FailureView | null;
      refreshChecks: Check[] | null;
      /** When the document was last known valid (from refreshStatus); null when unknown. */
      lastValidAt: string | null;
      removing: boolean;
      removeFailure: FailureView | null;
    }
  | { phase: 'removed' };

export type DetailEvent =
  | { type: 'loaded'; result: { ok: true; credential: CredentialDetails } | Failed }
  | { type: 'refresh' }
  | { type: 'refreshed'; result: { ok: true; status: CredentialDetails['status']; checks?: Check[]; checkedAt?: string; lastValidAt?: string | null } | Failed; checkedAt: string }
  | { type: 'remove' }
  | { type: 'removed'; result: { ok: true } | Failed }
  | { type: 'failed'; code: FailureCode };

export const initialDetailState: DetailState = { phase: 'loading' };

export function detailReducer(state: DetailState, event: DetailEvent): DetailState {
  switch (event.type) {
    case 'loaded':
      return event.result.ok
        ? {
            phase: 'loaded',
            details: event.result.credential,
            refreshing: false,
            refreshFailure: null,
            refreshChecks: null,
            lastValidAt: event.result.credential.status === 'valid' ? event.result.credential.statusCheckedAt : null,
            removing: false,
            removeFailure: null,
          }
        : { phase: 'failed', failure: failureView(event.result.code) };
    case 'failed':
      return { phase: 'failed', failure: failureView(event.code) };
    case 'refresh':
      return state.phase === 'loaded' && !state.refreshing && !state.removing ? { ...state, refreshing: true, refreshFailure: null } : state;
    case 'refreshed':
      if (state.phase !== 'loaded' || !state.refreshing) return state;
      return event.result.ok
        ? {
            ...state,
            refreshing: false,
            refreshChecks: event.result.checks ?? null,
            lastValidAt: event.result.lastValidAt === undefined ? state.lastValidAt : event.result.lastValidAt,
            details: { ...state.details, status: event.result.status, statusCheckedAt: event.result.checkedAt ?? event.checkedAt },
          }
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
