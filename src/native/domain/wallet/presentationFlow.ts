// Sharing a document with a verifier (OpenID4VP; ADR-0011, ADR-0008 §5, ADR-0015 §5): the state
// machine of the consent screen and what it shows. Pure: screens dispatch SDK results and render.
import type { PresentationMatch, ResolvedPresentation, WalletFailure } from '@identra/sdk-app';
import { VCT } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import type { ActivityLog, CredentialStatus } from '../../types';
import { diplomaClaimLabelKeys, displayClaims, documentNameKeys, documentTypeOf, type DiplomaClaim } from './credentialPresentation';
import type { WalletApi } from './walletContainer';
import type { FlowSession } from './walletFlows';
import { failureCodeOfError, MAYBE_SENT_CODES, presentationFailureView, type FailureCode, type FailureView } from './walletMessages';
import { issuerLabel, type Locale } from './walletViews';

/** Resolve failures after which no consent UI may appear: the wallet could not establish who is asking. */
export const RETRY_LATER_CODES: ReadonlySet<FailureCode> = new Set(['TRUST_LIST_UNAVAILABLE', 'NETWORK_ERROR', 'VERIFIER_ERROR', 'DEVICE_LOCKED', 'USER_CANCELLED', 'STORAGE_ERROR']);

/** Submit failures that leave the person on the consent screen: nothing was sent. */
const BACK_TO_CONSENT: ReadonlySet<FailureCode> = new Set(['USER_CANCELLED', 'DEVICE_LOCKED']);

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
  /** The last attempt failed but nothing was sent (prompt cancelled, phone locked). */
  failure: FailureView | null;
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
  | { phase: 'failed'; failure: FailureView; credentialId: string }
  | { phase: 'declined' };

export type PresentEvent =
  /** `nowMs`: a request already past its expiry is expired from the start, not from the first tick. */
  | { type: 'resolved'; result: { ok: true; request: ResolvedPresentation } | WalletFailure | { ok: false; code: FailureCode }; nowMs: number }
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
  | { type: 'submitted'; result: { ok: true } | WalletFailure | { ok: false; code: FailureCode } }
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

export function presentReducer(state: PresentState, event: PresentEvent): PresentState {
  switch (event.type) {
    case 'resolved': {
      if (state.phase !== 'resolving') return state;
      const result = event.result;
      if (!result.ok) {
        const failure = presentationFailureView(result.code, 'resolve');
        return { phase: 'refused', failure, retryLater: RETRY_LATER_CODES.has(failure.code) };
      }
      const request = result.request;
      if (request.matches.length === 0) {
        return { phase: 'no-match', request, documentNameKey: documentNameKeys[documentTypeOf(VCT.diploma)] };
      }
      const first = firstChoice(request);
      return {
        phase: 'consent', request, credentialId: first.credentialId, claimSetIndex: first.claimSets[0]!.index,
        untrusted: request.verifier.trusted ? null : 'warning', statuses: {}, refreshing: false, expired: event.nowMs >= Date.parse(request.expiresAt), failure: null,
      };
    }
    case 'statuses': {
      if (state.phase !== 'consent') return state;
      const statuses = { ...state.statuses, ...event.statuses };
      const current = statuses[state.credentialId];
      if (isBlocking(current)) {
        const better = firstChoice(state.request, statuses);
        if (better.credentialId !== state.credentialId) return { ...state, statuses, credentialId: better.credentialId, claimSetIndex: better.claimSets[0]!.index };
      }
      return { ...state, statuses };
    }
    case 'select-document': {
      if (state.phase !== 'consent' || event.credentialId === state.credentialId) return state;
      const match = state.request.matches.find((m) => m.credentialId === event.credentialId);
      return match ? { ...state, credentialId: match.credentialId, claimSetIndex: match.claimSets[0]!.index, failure: null } : state;
    }
    case 'select-claim-set': {
      if (state.phase !== 'consent') return state;
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
      return BACK_TO_CONSENT.has(failure.code) ? { ...state, phase: 'consent', failure } : { phase: 'failed', failure, credentialId: state.credentialId };
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

export interface DocumentChoice {
  credentialId: string;
  nameKey: I18nKey;
  issuerName: string;
}

export function documentChoices(request: ResolvedPresentation, issuerUris: Record<string, string>, locale: Locale): DocumentChoice[] {
  return request.matches.map((m) => ({
    credentialId: m.credentialId,
    nameKey: documentNameKeys[documentTypeOf(m.vct)],
    issuerName: issuerLabel(issuerUris[m.credentialId] ?? '', m.issuerName, locale),
  }));
}

// ---------------------------------------------------------------- activity log

/** `uncertain`: the answer was posted but no confirmation came back, so it may have arrived. */
export type ShareOutcome = 'success' | 'failed' | 'uncertain';

const ACTIVITY_TITLES: Record<ShareOutcome, I18nKey> = {
  success: 'wallet.present.activity.sharedTitle',
  failed: 'wallet.present.activity.failedTitle',
  uncertain: 'wallet.present.activity.maybeSentTitle',
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
}): ActivityLog {
  const { t } = input;
  const labels = input.claims.map((n) => t(labelKeyOf(n) ?? ('wallet.present.unknownField' as I18nKey)));
  return {
    id: input.id,
    timestamp: input.now.toISOString(),
    type: 'share',
    status: input.outcome,
    title: t(ACTIVITY_TITLES[input.outcome], { document: t(input.documentNameKey) }),
    description: labels.join(', '),
    partner: input.verifierName ?? t('wallet.present.activity.unverifiedPartner'),
    credentialId: input.credentialId,
    sharedClaims: input.claims.filter((n) => /^[a-z_]{1,40}$/.test(n)),
    unread: false,
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
  if (state.phase === 'failed') return MAYBE_SENT_CODES.has(state.failure.code) ? 'uncertain' : 'failed';
  return null;
}

export interface ShareAttempt {
  outcome: ShareOutcome;
  documentNameKey: I18nKey;
  request: ResolvedPresentation;
  credentialId: string;
  /** The field names of the submitted claim set. */
  claims: string[];
}

/**
 * The consent screen's actions on its reducer state. `share` submits at most once at a time (a
 * double tap does nothing) and returns what to record; `leave` declines locally when the request
 * is still unanswered (back button, unmount).
 */
export function createPresentationActions(wallet: Pick<WalletApi, 'presentations'>, session: FlowSession<PresentState, PresentEvent>) {
  let inFlight = false;
  return {
    /** `onSubmit`: right before the signing key is used (its biometric prompt follows). */
    async share(onSubmit?: () => void): Promise<ShareAttempt | null> {
      const s = session.get();
      if (inFlight || s.phase !== 'consent' || shareBlock(s) !== null) return null;
      inFlight = true;
      try {
        const choice = submissionOf(s);
        session.dispatch({ type: 'submit' });
        onSubmit?.();
        let result: { ok: true } | WalletFailure | { ok: false; code: FailureCode };
        try {
          result = await wallet.presentations.submit(s.request, choice);
        } catch (error) {
          result = { ok: false, code: failureCodeOfError(error) };
        }
        session.dispatch({ type: 'submitted', result });
        const outcome = shareOutcomeOf(session.get());
        if (!outcome) return null;
        const match = s.request.matches.find((m) => m.credentialId === choice.credentialId)!;
        return { outcome, documentNameKey: documentNameKeys[documentTypeOf(match.vct)], request: s.request, credentialId: choice.credentialId, claims: [...match.claimSets.find((c) => c.index === choice.claimSetIndex)!.claims] };
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
