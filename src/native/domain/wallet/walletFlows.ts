// State machines of the receive, detail and restore screens. Pure reducers: screens dispatch the
// SDK results they get and render the state. The PIN is never part of any state here.
import type { AcceptResult, CredentialDetails, ResolvedOffer, WalletFailure } from '@identra/sdk-app';
import type { Check } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import { failureCodeOfError, failureView, type FailureCode, type FailureView } from './walletMessages';
import type { WalletApi, WalletStartupState } from './walletContainer';

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
  /**
   * Who offers what, PIN entry. `failure`: the one-time code was NOT redeemed (wrong PIN, PIN
   * missing, or the request got no answer): the PIN step again; the PIN stays in the component
   * except after a wrong one.
   */
  | { phase: 'consent'; offer: ResolvedOffer; failure: FailureView | null; attempt: number }
  /** The code was redeemed and the SDK can resume (`retryable && codeRedeemed`): "Thử lại" without the PIN. */
  | { phase: 'resume'; offer: ResolvedOffer; failure: FailureView; attempt: number }
  /**
   * `keyPrompt`: this attempt asks for the fingerprint or face (a new key). False only when the SDK
   * holds a received credential and its key and just verifies it again (issuer DID not resolved).
   */
  | { phase: 'accepting'; offer: ResolvedOffer; attempt: number; resuming: boolean; keyPrompt: boolean }
  /**
   * `status`: `unknown` when the lists were unreachable at receipt (the SDK keeps the document).
   * `issuerDid`: the DID path (ADR-0020), whose issuer has no name. `keyAuthenticated`: the person
   * just passed the biometric prompt for the new key (the access gate may trust it for a moment).
   */
  | { phase: 'received'; credentialId: string; vct: string; issuerName: string | null; issuerDid: string | null; issuerUri: string; status: 'valid' | 'unknown'; keyAuthenticated: boolean }
  /**
   * Final: nothing was saved and this offer cannot complete; a new code is needed. `codeSpent`:
   * the code is known to be used (redeemed by this wallet, or the issuer says it is gone).
   */
  | { phase: 'accept-failed'; failure: FailureView; issuerUri: string; codeSpent: boolean };

export type ReceiveEvent =
  | { type: 'device-checked'; ready: boolean }
  | { type: 'resolved'; result: { ok: true; offer: ResolvedOffer } | WalletFailure }
  | { type: 'submit' }
  | { type: 'accepted'; result: AcceptResult }
  | { type: 'accept-threw'; code: FailureCode }
  | { type: 'retry-resolve' };

export const initialReceiveState: ReceiveState = { phase: 'checking-device' };

/** Failures with their own sentence once the code was redeemed (the generic one could claim "nothing changed"). */
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
  DID_RESOLUTION_UNAVAILABLE: 'wallet.receive.resume.DID_RESOLUTION_UNAVAILABLE',
};
/** Back on the PIN step with the code not redeemed: say that it was not sent, not that it is spent. */
const NOT_REDEEMED_SENTENCES: Partial<Record<FailureCode, I18nKey>> = {
  NETWORK_ERROR: 'wallet.receive.notSent',
};

/** What an `accept` failure says about the offer. Fields the SDK is adding are read defensively. */
export interface AcceptOutcome {
  code: FailureCode;
  checks?: Check[];
  /** The same offer can still complete. */
  retryable: boolean;
  /** The one-time code was redeemed (never sent again). Undefined from an older SDK: false. */
  codeRedeemed: boolean;
}

export function acceptOutcomeOf(failure: { code: FailureCode; checks?: Check[] }, offer: ResolvedOffer): AcceptOutcome {
  const f = failure as { retryable?: unknown; codeRedeemed?: unknown };
  const offerRedeemed = (offer as { codeRedeemed?: unknown }).codeRedeemed === true;
  // The credential arrived but CertNet did not answer for its issuer (ADR-0020): not the issuer's
  // network, and nothing was stored; the SDK keeps it to verify again.
  const didUnresolved = failure.code === 'NETWORK_ERROR' && !!failure.checks?.some((c) => c.id === 'did_resolution' && c.code === 'DID_RESOLUTION_UNAVAILABLE');
  return {
    code: didUnresolved ? 'DID_RESOLUTION_UNAVAILABLE' : failure.code,
    ...(failure.checks ? { checks: failure.checks } : {}),
    retryable: f.retryable === true,
    codeRedeemed: typeof f.codeRedeemed === 'boolean' ? f.codeRedeemed : offerRedeemed,
  };
}

function acceptFailure(state: Extract<ReceiveState, { phase: 'accepting' }>, outcome: AcceptOutcome): ReceiveState {
  const { code, retryable, codeRedeemed } = outcome;
  const base = failureView(code, outcome.checks);
  if (retryable && !codeRedeemed) {
    // The code still works: the PIN step again (the PIN is kept, except after a wrong one).
    return { phase: 'consent', offer: state.offer, attempt: state.attempt, failure: { ...base, sentenceKey: NOT_REDEEMED_SENTENCES[code] ?? base.sentenceKey } };
  }
  if (retryable) {
    return { phase: 'resume', offer: state.offer, attempt: state.attempt, failure: { ...base, action: 'retry', sentenceKey: RESUME_SENTENCES[code] ?? base.sentenceKey } };
  }
  // "Used" only when it is known: redeemed here, or the issuer no longer serves the offer.
  const codeSpent = codeRedeemed || code === 'OFFER_EXPIRED';
  const sentenceKey = codeRedeemed ? (AFTER_PIN_SENTENCES[code] ?? base.sentenceKey) : base.sentenceKey;
  return {
    phase: 'accept-failed',
    issuerUri: state.offer.issuerUri,
    codeSpent,
    failure: { ...base, sentenceKey, action: base.action === 'scan-again' ? 'scan-again' : 'contact-issuer' },
  };
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
      if (state.phase === 'consent') return { phase: 'accepting', offer: state.offer, attempt: state.attempt + 1, resuming: false, keyPrompt: true };
      if (state.phase === 'resume') return { phase: 'accepting', offer: state.offer, attempt: state.attempt + 1, resuming: true, keyPrompt: state.failure.code !== 'DID_RESOLUTION_UNAVAILABLE' };
      return state;
    case 'accepted':
    case 'accept-threw': {
      if (state.phase !== 'accepting') return state;
      if (event.type === 'accepted' && event.result.ok) {
        // Read defensively: `status` is new in the SDK's accept result.
        const status = (event.result as { status?: unknown }).status === 'unknown' ? 'unknown' : 'valid';
        // issuerName is null when the trust list could not be read at receipt (status unknown), and always on the DID path.
        const issuerDid = typeof event.result.issuerDid === 'string' ? event.result.issuerDid : null;
        return {
          phase: 'received',
          credentialId: event.result.credentialId,
          vct: event.result.vct,
          issuerName: issuerDid ? null : event.result.issuerName,
          issuerDid,
          issuerUri: state.offer.issuerUri,
          status,
          keyAuthenticated: state.keyPrompt,
        };
      }
      if (event.type === 'accept-threw') return acceptFailure(state, { code: event.code, retryable: false, codeRedeemed: false });
      return acceptFailure(state, acceptOutcomeOf(event.result as WalletFailure, state.offer));
    }
  }
}

/** The PIN field must be emptied after this transition (wrong PIN): the component owns the PIN. */
export function shouldClearPin(previous: ReceiveState, next: ReceiveState): boolean {
  return previous.phase === 'accepting' && next.phase === 'consent' && next.failure?.code === 'TX_CODE_WRONG';
}

/**
 * What "Nhận" / "Thử lại" sends, or null when the state does not allow a submit: the PIN only on
 * the PIN step and only when complete; on resume nothing (the SDK holds the token).
 */
export function acceptInput(state: ReceiveState, pin: string, pinLength: number | null): { txCode?: string } | null {
  if (state.phase === 'resume') return {};
  if (state.phase !== 'consent') return null;
  if (pinLength === null) return {};
  return pin.length === pinLength ? { txCode: pin } : null;
}

export interface FlowSession<S, E> {
  get(): S;
  dispatch(event: E): void;
}

/** The receive screen's submit: one accept of the reducer's offer at a time (the reducer leaves consent/resume at once). */
export async function runAccept(session: FlowSession<ReceiveState, ReceiveEvent>, wallet: Pick<WalletApi, 'offers'>, pin: string, pinLength: number | null): Promise<void> {
  const current = session.get();
  const input = acceptInput(current, pin, pinLength);
  if (!input || (current.phase !== 'consent' && current.phase !== 'resume')) return;
  session.dispatch({ type: 'submit' });
  try {
    session.dispatch({ type: 'accepted', result: await wallet.offers.accept(current.offer, input) });
  } catch (error) {
    session.dispatch({ type: 'accept-threw', code: failureCodeOfError(error) });
  }
}

/** Leaving the receive screen without the document: the SDK forgets the offer's token and any key waiting for a retried save. */
export function abandonOffer(state: ReceiveState, lastOffer: ResolvedOffer | null, wallet: Pick<WalletApi, 'offers'>): void {
  const offer = state.phase === 'consent' || state.phase === 'resume' || state.phase === 'accepting' ? state.offer : state.phase === 'accept-failed' ? lastOffer : null;
  if (offer) void wallet.offers.discard(offer).catch(() => undefined);
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
