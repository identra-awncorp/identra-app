// Sharing a document with a verifier (OpenID4VP; ADR-0011, ADR-0008 §5, ADR-0015 §5): the state
// machine of the consent screen and what it shows. Pure: screens dispatch SDK results and render.
import { MAX_PRESENTATION_SENDS, type PresentationMatch, type ResolvedPresentation, type WalletFailure } from '@identra/sdk-app';
import { VCT } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import type { ActivityLog, CredentialStatus, ShareLock } from '../../types';
import { diplomaClaimLabelKeys, displayClaims, documentNameKeys, documentTypeOf, type DiplomaClaim } from './credentialPresentation';
import type { WalletApi } from './walletContainer';
import type { FlowSession } from './walletFlows';
import { failureCodeOfError, MAYBE_SENT_CODES, presentationFailureView, type FailureCode, type FailureView } from './walletMessages';
import { issuerViewOf, type IssuerView, type Locale } from './walletViews';

/** Resolve failures after which no consent UI may appear: the wallet could not establish who is asking. */
export const RETRY_LATER_CODES: ReadonlySet<FailureCode> = new Set(['TRUST_LIST_UNAVAILABLE', 'NETWORK_ERROR', 'VERIFIER_ERROR', 'DEVICE_LOCKED', 'USER_CANCELLED', 'STORAGE_ERROR']);

/**
 * Submit failures that leave the person on the consent screen with the same selection: nothing was sent
 * (cancelled prompt, locked phone). "Chia sẻ" there is the retry. The requester that RECEIVED the
 * document but could not check it now (DID_RESOLUTION_UNAVAILABLE, `delivered`) also leaves the
 * person there, locked to what was sent (`ConsentState.delivered`).
 */
const BACK_TO_CONSENT: ReadonlySet<FailureCode> = new Set(['USER_CANCELLED', 'DEVICE_LOCKED']);

/** The SDK's "the verifier received it and concluded nothing" (it comes only with `delivered: true`). */
const wasDelivered = (result: { ok: false; code: FailureCode; delivered?: unknown }): boolean => result.delivered === true || result.code === 'DID_RESOLUTION_UNAVAILABLE';

export type UntrustedStep = 'warning' | 'confirming' | 'confirmed';

export interface ConsentState {
  phase: 'consent';
  request: ResolvedPresentation;
  credentialId: string;
  claimSetIndex: number;
  /** Only for an untrusted verifier: sharing needs a deliberate second step. */
  untrusted: UntrustedStep | null;
  /** Local status of each matching document (a revoked one cannot be shared). */
  statuses: Record<string, CredentialStatus>;
  refreshing: boolean;
  expired: boolean;
  /** The last attempt failed: nothing was sent (prompt cancelled, phone locked), or `delivered`. */
  failure: FailureView | null;
  /**
   * The requester received this document and claim set but concluded nothing (it could not reach
   * CertNet). The SDK pins the request to them: the selection is locked, the only actions are sending
   * the same again and stopping.
   */
  delivered: boolean;
  /** How many times this request was sent so far (the SDK's count, or the history's after a restart). */
  sends: number;
  /** The history entry of this request's earlier sends, found again after a remount or a restart; null: none yet. */
  record: ShareRecord | null;
}

/** A history entry a later send of the same request updates (one entry per request). */
export interface ShareRecord {
  id: string;
  /** Until when the request stays locked to what was sent (600 s from the first delivery, like the SDK's pin). */
  lockedUntil: string | null;
}

/** The SDK's pin lasts 600 s from the first delivery (architecture.md §9); the history entry keeps the same deadline. */
export const PIN_MS = 600_000;

/** What this wallet already sent for a QR and has no result for: its history entry (pending), if any. */
export interface SentShare extends ShareRecord {
  credentialId: string;
  claims: readonly string[];
  sends: number;
}

/**
 * The history entry this wallet wrote for this QR (`requestRef`) when the requester received the
 * document and gave no result (status pending), or with the history off its `ShareLock`: how the lock
 * and the entry are found again after a remount, and after an app restart, when the SDK's in-memory
 * pin is gone. A lock is there only when the latest send of that request was made with the history
 * off (writing the entry removes it), so it is the newer of the two.
 */
export function sentShareOf(logs: readonly ActivityLog[], requestRef: string, locks: readonly ShareLock[]): SentShare | null {
  const log = locks.find((l) => l.requestRef === requestRef)
    ?? logs.find((l) => l.type === 'share' && l.status === 'pending' && l.requestRef === requestRef && l.credentialId && l.sharedClaims);
  return log ? { id: log.id, lockedUntil: log.lockedUntil ?? null, credentialId: log.credentialId!, claims: log.sharedClaims!, sends: log.sends ?? 1 } : null;
}

export type PresentState =
  | { phase: 'resolving' }
  /** Hard failure: no consent UI. `retryLater`: the verifier could not be checked now (network, trust list). */
  | { phase: 'refused'; failure: FailureView; retryLater: boolean }
  /** The request is fine but nothing in the wallet matches it. */
  | { phase: 'no-match'; request: ResolvedPresentation; documentNameKey: I18nKey }
  | ConsentState
  | (Omit<ConsentState, 'phase'> & { phase: 'submitting' })
  | { phase: 'sent'; verifierName: string | null; credentialId: string; claims: string[] }
  /** `delivered`: an earlier attempt of this request reached the requester (what it says, and the history, keep that). */
  | { phase: 'failed'; failure: FailureView; credentialId: string; delivered: boolean }
  | { phase: 'declined' };

export type PresentEvent =
  /**
   * `nowMs`: a request already past its expiry is expired from the start, not from the first tick.
   * `sent`: this QR's history entry of a delivered share (`sentShareOf`), if any.
   */
  | { type: 'resolved'; result: { ok: true; request: ResolvedPresentation } | WalletFailure | { ok: false; code: FailureCode }; nowMs: number; sent?: SentShare | null }
  | { type: 'statuses'; statuses: Record<string, CredentialStatus> }
  | { type: 'select-document'; credentialId: string }
  | { type: 'select-claim-set'; index: number }
  | { type: 'share-untrusted' }
  | { type: 'confirm-untrusted' }
  | { type: 'cancel-untrusted' }
  | { type: 'refresh-status' }
  | { type: 'status-refreshed'; credentialId: string; status: CredentialStatus | null }
  | { type: 'tick'; nowMs: number }
  | { type: 'submit' }
  | { type: 'submitted'; result: { ok: true } | WalletFailure | { ok: false; code: FailureCode; delivered?: true } }
  | { type: 'decline' }
  /** Try the same QR again after a "check later" refusal. */
  | { type: 'retry' };

export const initialPresentState: PresentState = { phase: 'resolving' };

/** Document statuses the requester would refuse: nothing is signed for them. */
export const BLOCKING_STATUSES = ['revoked', 'suspended', 'invalid', 'expired'] as const satisfies readonly CredentialStatus[];
export type BlockingStatus = (typeof BLOCKING_STATUSES)[number];
const isBlocking = (status: CredentialStatus | undefined): status is BlockingStatus => (BLOCKING_STATUSES as readonly string[]).includes(status ?? '');

export type ShareBlock = 'request-expired' | BlockingStatus | 'untrusted';

/** Whether the selected document may be shared now, and if not, why. */
export function shareBlock(state: ConsentState): ShareBlock | null {
  if (state.expired) return 'request-expired';
  const status = state.statuses[state.credentialId];
  if (isBlocking(status)) return status;
  if (state.untrusted !== null && state.untrusted !== 'confirmed') return 'untrusted';
  return null;
}

function firstChoice(request: ResolvedPresentation, statuses: Record<string, CredentialStatus> = {}): PresentationMatch {
  // A document that can be shared before one that is revoked or suspended.
  return request.matches.find((m) => !isBlocking(statuses[m.credentialId])) ?? request.matches[0]!;
}

/** The end of a request the requester already received: nothing more can be sent, what was sent stays sent. */
const closedAfterDelivery = (credentialId: string): PresentState => ({ phase: 'failed', failure: presentationFailureView('REQUEST_INVALID', 'resolve', { delivered: true }), credentialId, delivered: true });

const sameNames = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((n) => b.includes(n));

/**
 * The selection a resolved request is locked to because this wallet already delivered it: the SDK's
 * pin, or, when the SDK has none (its memory is gone after an app restart), this QR's history entry
 * within its 600 s. 'closed': locked, but it can no longer be sent (that document or those fields are
 * no longer offered, or the sends are used up). null: never delivered, an ordinary consent.
 */
function lockOf(request: ResolvedPresentation, sent: SentShare | null, nowMs: number): { credentialId: string; claimSetIndex: number; sends: number; record: ShareRecord | null } | 'closed' | null {
  const pin = request.pinned;
  const restored = !pin && sent !== null && sent.lockedUntil !== null && nowMs < Date.parse(sent.lockedUntil);
  if (!pin && !restored) return null;
  const credentialId = pin ? pin.credentialId : sent!.credentialId;
  const entry = sent?.credentialId === credentialId ? sent : null;
  // The SDK counts again from zero after a restart; the history keeps the sends made before it.
  const sends = Math.max(pin?.sends ?? 0, entry?.sends ?? 0);
  const claimSets = request.matches.find((m) => m.credentialId === credentialId)?.claimSets ?? [];
  const set = pin ? claimSets.find((c) => c.index === pin.claimSetIndex) : claimSets.find((c) => sameNames(c.claims, sent!.claims));
  if (!set || sends >= MAX_PRESENTATION_SENDS) return 'closed';
  return { credentialId, claimSetIndex: set.index, sends, record: entry ? { id: entry.id, lockedUntil: entry.lockedUntil } : null };
}

export function presentReducer(state: PresentState, event: PresentEvent): PresentState {
  switch (event.type) {
    case 'resolved': {
      if (state.phase !== 'resolving') return state;
      const result = event.result;
      const sent = event.sent ?? null;
      if (!result.ok) {
        // The same QR once its sends are used up: the history says it was sent, so not "this code is not valid".
        if (sent && result.code === 'REQUEST_INVALID') return closedAfterDelivery(sent.credentialId);
        const failure = presentationFailureView(result.code, 'resolve');
        return { phase: 'refused', failure, retryLater: RETRY_LATER_CODES.has(failure.code) };
      }
      const request = result.request;
      // A request already delivered opens locked, as after the first "could not check" answer, never as an ordinary consent.
      const lock = lockOf(request, sent, event.nowMs);
      if (lock === 'closed') return closedAfterDelivery(request.pinned?.credentialId ?? sent!.credentialId);
      if (request.matches.length === 0) {
        return { phase: 'no-match', request, documentNameKey: documentNameKeys[documentTypeOf(VCT.diploma)] };
      }
      const first = firstChoice(request);
      return {
        phase: 'consent', request,
        credentialId: lock ? lock.credentialId : first.credentialId,
        claimSetIndex: lock ? lock.claimSetIndex : first.claimSets[0]!.index,
        // An untrusted requester was confirmed twice before that first send, as on the screen that sent it.
        untrusted: request.verifier.trusted ? null : lock ? 'confirmed' : 'warning',
        statuses: {}, refreshing: false, expired: event.nowMs >= Date.parse(request.expiresAt),
        failure: lock ? presentationFailureView('DID_RESOLUTION_UNAVAILABLE', 'submit') : null,
        delivered: lock !== null, sends: lock?.sends ?? 0, record: lock?.record ?? null,
      };
    }
    case 'statuses': {
      if (state.phase !== 'consent') return state;
      const statuses = { ...state.statuses, ...event.statuses };
      const current = statuses[state.credentialId];
      if (isBlocking(current) && !state.delivered) {
        const better = firstChoice(state.request, statuses);
        if (better.credentialId !== state.credentialId) return { ...state, statuses, credentialId: better.credentialId, claimSetIndex: better.claimSets[0]!.index };
      }
      return { ...state, statuses };
    }
    case 'select-document': {
      if (state.phase !== 'consent' || state.delivered || event.credentialId === state.credentialId) return state;
      const match = state.request.matches.find((m) => m.credentialId === event.credentialId);
      return match ? { ...state, credentialId: match.credentialId, claimSetIndex: match.claimSets[0]!.index, failure: null } : state;
    }
    case 'select-claim-set': {
      if (state.phase !== 'consent' || state.delivered) return state;
      const match = state.request.matches.find((m) => m.credentialId === state.credentialId);
      return match?.claimSets.some((c) => c.index === event.index) ? { ...state, claimSetIndex: event.index } : state;
    }
    case 'share-untrusted':
      return state.phase === 'consent' && state.untrusted === 'warning' && !state.expired ? { ...state, untrusted: 'confirming' } : state;
    case 'confirm-untrusted':
      return state.phase === 'consent' && state.untrusted === 'confirming' ? { ...state, untrusted: 'confirmed' } : state;
    case 'cancel-untrusted':
      return state.phase === 'consent' && state.untrusted === 'confirming' ? { ...state, untrusted: 'warning' } : state;
    case 'refresh-status':
      return state.phase === 'consent' && !state.refreshing ? { ...state, refreshing: true } : state;
    case 'status-refreshed':
      if (state.phase !== 'consent') return state;
      return { ...state, refreshing: false, statuses: event.status ? { ...state.statuses, [event.credentialId]: event.status } : state.statuses };
    case 'tick': {
      if (state.phase !== 'consent' || state.expired) return state;
      return event.nowMs >= Date.parse(state.request.expiresAt) ? { ...state, expired: true, untrusted: state.untrusted === 'confirming' ? 'warning' : state.untrusted } : state;
    }
    case 'submit':
      // One submit only: anything but a shareable consent state ignores it.
      return state.phase === 'consent' && shareBlock(state) === null ? { ...state, phase: 'submitting', failure: null } : state;
    case 'submitted': {
      if (state.phase !== 'submitting') return state;
      if (event.result.ok) {
        const match = state.request.matches.find((m) => m.credentialId === state.credentialId)!;
        const claims = match.claimSets.find((c) => c.index === state.claimSetIndex)!.claims;
        return { phase: 'sent', verifierName: state.request.verifier.trusted ? state.request.verifier.ten : null, credentialId: state.credentialId, claims: [...claims] };
      }
      const failure = presentationFailureView(event.result.code, 'submit');
      if (wasDelivered(event.result)) {
        // The SDK answers the last allowed send with VERIFIER_ERROR; after a restart its count starts again, the history's does not.
        const sends = state.sends + 1;
        return sends >= MAX_PRESENTATION_SENDS ? closedAfterDelivery(state.credentialId) : { ...state, phase: 'consent', failure, delivered: true, sends };
      }
      if (BACK_TO_CONSENT.has(failure.code)) return { ...state, phase: 'consent', failure };
      // Never back to a consent screen after that: the request is used up (REQUEST_INVALID, the last send's VERIFIER_ERROR...).
      return { phase: 'failed', failure: presentationFailureView(event.result.code, 'submit', { delivered: state.delivered }), credentialId: state.credentialId, delivered: state.delivered };
    }
    case 'decline':
      return state.phase === 'consent' || state.phase === 'no-match' ? { phase: 'declined' } : state;
    case 'retry':
      return state.phase === 'refused' && state.retryLater ? initialPresentState : state;
  }
}

// ---------------------------------------------------------------- what the consent screen shows

export interface ConsentField {
  name: string;
  labelKey: I18nKey;
  value: string;
}

/** One of the verifier's options (claim sets, in its order of preference). */
export interface ClaimSetOption {
  index: number;
  /** The verifier's first option ("as requested"). */
  first: boolean;
  /** Exactly the fields this option sends. */
  fields: ConsentField[];
  /** Compared with the chosen option: what switching adds and drops (both, should a set not be nested). */
  added: ConsentField[];
  dropped: ConsentField[];
}

export interface ClaimSetChoice {
  /** The claim set index to submit. */
  index: number;
  /** Shared in every option the verifier offers: cannot be left out (only declining avoids it). */
  required: ConsentField[];
  /** Shared in this option but not in every one. */
  optional: ConsentField[];
  /** Not requested at all: stays on the phone. */
  withheld: ConsentField[];
  /** Every option, the chosen one included. */
  options: ClaimSetOption[];
}

const labelKeyOf = (name: string): I18nKey | null => (Object.hasOwn(diplomaClaimLabelKeys, name) ? diplomaClaimLabelKeys[name as DiplomaClaim] : null);
/** The label of a field name (unknown names read "Thông tin khác"). */
export const fieldLabelKey = (name: string): I18nKey => labelKeyOf(name) ?? ('wallet.present.unknownField' as I18nKey);

/**
 * Required / optional / withheld fields of the chosen claim set, with the values that would leave
 * the phone (`claims`: the stored disclosures of the document, from credentials.get), and every
 * option with what it would add or drop.
 */
export function claimSetChoice(match: PresentationMatch, claimSetIndex: number, vct: string, claims: Record<string, unknown>, locale: Locale): ClaimSetChoice {
  const display = new Map(displayClaims(vct, claims, locale).map((c) => [c.name as string, c]));
  const field = (name: string): ConsentField => ({ name, labelKey: labelKeyOf(name) ?? ('wallet.present.unknownField' as I18nKey), value: display.get(name)?.value ?? String(claims[name] ?? '') });
  const sets = match.claimSets;
  const chosen = sets.find((s) => s.index === claimSetIndex) ?? sets[0]!;
  const inAll = sets.reduce<string[]>((acc, s) => acc.filter((n) => s.claims.includes(n)), [...sets[0]!.claims]);
  const displayOrder = [...display.keys()];
  const rank = (n: string) => {
    const i = displayOrder.indexOf(n);
    return i === -1 ? 999 : i;
  };
  const fields = (names: readonly string[]) => [...names].sort((a, b) => rank(a) - rank(b)).map(field);
  const shared = new Set(chosen.claims);
  return {
    index: chosen.index,
    required: fields(chosen.claims.filter((n) => inAll.includes(n))),
    optional: fields(chosen.claims.filter((n) => !inAll.includes(n))),
    withheld: fields(displayOrder.filter((n) => !shared.has(n))),
    options: sets.map((s, i) => ({
      index: s.index,
      first: i === 0,
      fields: fields(s.claims),
      added: fields(s.claims.filter((n) => !shared.has(n))),
      dropped: fields(chosen.claims.filter((n) => !s.claims.includes(n))),
    })),
  };
}

/** The verifier's purpose, only for a trusted verifier: a string or `{ vi, en }`, at most 300 characters. */
export function purposeText(request: ResolvedPresentation, locale: Locale): string | null {
  if (!request.verifier.trusted) return null;
  const p = request.purpose;
  const text = typeof p === 'string' ? p : p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>)[locale] ?? (p as Record<string, unknown>)['vi'] : null;
  return typeof text === 'string' && text.trim() !== '' && text.length <= 300 ? text.trim() : null;
}

export function secondsLeft(expiresAt: string, nowMs: number): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - nowMs) / 1000));
}

/** `m:ss` for the countdown. */
export function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export interface DocumentChoice extends IssuerView {
  credentialId: string;
  nameKey: I18nKey;
}

export function documentChoices(request: ResolvedPresentation, issuerUris: Record<string, string>, locale: Locale): DocumentChoice[] {
  return request.matches.map((m) => ({
    credentialId: m.credentialId,
    nameKey: documentNameKeys[documentTypeOf(m.vct)],
    ...issuerViewOf({ issuerUri: issuerUris[m.credentialId] ?? '', issuerName: m.issuerName, trustPath: m.trustPath, issuerDid: m.issuerDid }, locale),
  }));
}

// ---------------------------------------------------------------- activity log

/**
 * `uncertain`: the answer was posted but no confirmation came back, so it may have arrived.
 * `delivered`: the requester received it and has no result yet (it could not reach CertNet); stored
 * with the history's `pending` status.
 */
export type ShareOutcome = 'success' | 'failed' | 'uncertain' | 'delivered';

const ACTIVITY_TITLES: Record<ShareOutcome, I18nKey> = {
  success: 'wallet.present.activity.sharedTitle',
  failed: 'wallet.present.activity.failedTitle',
  uncertain: 'wallet.present.activity.maybeSentTitle',
  delivered: 'wallet.present.activity.deliveredTitle',
};

/**
 * The local record of a presentation: who, which document, which FIELD NAMES, when, outcome.
 * Never a claim value (only names and translated labels go in).
 */
export function presentationActivityEntry(input: {
  id: string;
  now: Date;
  verifierName: string | null;
  credentialId: string;
  documentNameKey: I18nKey;
  claims: readonly string[];
  outcome: ShareOutcome;
  t: (key: I18nKey, params?: Record<string, string>) => string;
  /** The requester's QR: how a later send of the same request finds this entry again. */
  requestRef?: string;
  /** How many times it was sent; said in the entry when more than once. */
  sends?: number;
  /** A delivered share: until when the request stays locked to what was sent. */
  lockedUntil?: string | null;
}): ActivityLog {
  const { t } = input;
  const labels = input.claims.map((n) => t(labelKeyOf(n) ?? ('wallet.present.unknownField' as I18nKey)));
  const sends = input.sends ?? 0;
  return {
    id: input.id,
    timestamp: input.now.toISOString(),
    type: 'share',
    status: input.outcome === 'delivered' ? 'pending' : input.outcome,
    title: t(ACTIVITY_TITLES[input.outcome], { document: t(input.documentNameKey) }),
    // Sent more than once: the requester holds that many signed copies (kept on one line: no-break spaces).
    description: sends > 1 ? `${labels.join(', ')} ·\u00a0${t('wallet.present.activity.sentTimes', { count: String(sends) }).replace(/ /g, '\u00a0')}` : labels.join(', '),
    partner: input.verifierName ?? t('wallet.present.activity.unverifiedPartner'),
    credentialId: input.credentialId,
    sharedClaims: input.claims.filter((n) => /^[a-z_]{1,40}$/.test(n)),
    unread: false,
    ...(input.requestRef ? { requestRef: input.requestRef } : {}),
    ...(sends > 0 ? { sends } : {}),
    ...(input.outcome === 'delivered' && input.lockedUntil ? { lockedUntil: input.lockedUntil } : {}),
  };
}

// ---------------------------------------------------------------- what the screen does

/** What "Chia sẻ" submits: the reducer's selection; `allowUntrusted` only after the second confirmation. */
export function submissionOf(state: ConsentState): { credentialId: string; claimSetIndex: number; allowUntrusted?: true } {
  return { credentialId: state.credentialId, claimSetIndex: state.claimSetIndex, ...(state.untrusted === 'confirmed' ? { allowUntrusted: true as const } : {}) };
}

/** How a finished attempt is recorded: null while nothing was attempted (back on the consent screen). */
export function shareOutcomeOf(state: PresentState): ShareOutcome | null {
  if (state.phase === 'sent') return 'success';
  if (state.phase === 'consent' && state.delivered && state.failure?.code === 'DID_RESOLUTION_UNAVAILABLE') return 'delivered';
  if (state.phase === 'failed') return MAYBE_SENT_CODES.has(state.failure.code) ? 'uncertain' : 'failed';
  return null;
}

export interface ShareAttempt {
  /**
   * The history entry to write: one per request. A later attempt of the same request (sent again
   * after `delivered`) replaces that entry instead of adding one, so what was shared counts once.
   */
  recordId: string;
  outcome: ShareOutcome;
  documentNameKey: I18nKey;
  request: ResolvedPresentation;
  credentialId: string;
  /** The field names of the submitted claim set. */
  claims: string[];
  /** How many times this request was sent, this attempt included. */
  sends: number;
  /** For a delivered share: until when the request stays locked (kept from the first delivery). */
  lockedUntil: string | null;
}

function randomRecordId(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  return `share-${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * The consent screen's actions on its reducer state. `share` submits at most once at a time (a
 * double tap does nothing) and returns what to record; `leave` declines locally when the request
 * is still unanswered (back button, unmount).
 *
 * History after the requester received the document once (`delivered`): the entry says so; every
 * later send of the same request updates THAT entry (found again after a remount or a restart:
 * `ConsentState.record`): a success makes it "shared", any other send that left the phone keeps it
 * "sent, no result" with the new count. Anything that sent nothing (request closed, a key failure,
 * the person stops) leaves it as it is.
 */
export function createPresentationActions(wallet: Pick<WalletApi, 'presentations'>, session: FlowSession<PresentState, PresentEvent>, newRecordId: () => string = randomRecordId, now: () => number = Date.now) {
  let inFlight = false;
  let record: { request: ResolvedPresentation; entry: ShareRecord } | null = null;
  return {
    /** `onSubmit`: right before the signing key is used (its biometric prompt follows). */
    async share(onSubmit?: () => void): Promise<ShareAttempt | null> {
      const s = session.get();
      if (inFlight || s.phase !== 'consent' || shareBlock(s) !== null) return null;
      inFlight = true;
      try {
        const choice = submissionOf(s);
        const reachedBefore = s.delivered;
        session.dispatch({ type: 'submit' });
        onSubmit?.();
        let result: { ok: true } | WalletFailure | { ok: false; code: FailureCode; delivered?: true };
        try {
          result = await wallet.presentations.submit(s.request, choice);
        } catch (error) {
          result = { ok: false, code: failureCodeOfError(error) };
        }
        session.dispatch({ type: 'submitted', result });
        // The answer left the phone: received (ok, delivered) or maybe received (no confirmation).
        const posted = result.ok || wasDelivered(result) || MAYBE_SENT_CODES.has(result.code);
        let outcome = shareOutcomeOf(session.get());
        if (reachedBefore) {
          if (!posted) return null;
          outcome = result.ok ? 'success' : 'delivered';
        }
        if (!outcome) return null;
        const entry = s.record ?? (record?.request === s.request ? record.entry : { id: newRecordId(), lockedUntil: new Date(now() + PIN_MS).toISOString() });
        record = { request: s.request, entry };
        const match = s.request.matches.find((m) => m.credentialId === choice.credentialId)!;
        return {
          recordId: entry.id, outcome, documentNameKey: documentNameKeys[documentTypeOf(match.vct)], request: s.request, credentialId: choice.credentialId,
          claims: [...match.claimSets.find((c) => c.index === choice.claimSetIndex)!.claims], sends: s.sends + (posted ? 1 : 0), lockedUntil: entry.lockedUntil,
        };
      } finally {
        inFlight = false;
      }
    },
    leave(): void {
      const s = session.get();
      if (s.phase !== 'consent' && s.phase !== 'no-match') return;
      try {
        void Promise.resolve(wallet.presentations.decline(s.request)).catch(() => undefined);
      } catch {
        // Local only: a request that cannot be declined is simply never answered.
      }
    },
  };
}
