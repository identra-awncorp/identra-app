// Sharing a document with a verifier (OpenID4VP; ADR-0011, ADR-0008 §5, ADR-0015 §5): the state
// machine of the consent screen and what it shows. Pure: screens dispatch SDK results and render.
import type { PresentationMatch, ResolvedPresentation, WalletFailure } from '@identra/sdk-app';
import { VCT } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import type { ActivityLog, CredentialStatus } from '../../types';
import { diplomaClaimLabelKeys, displayClaims, documentNameKeys, documentTypeOf, type DiplomaClaim } from './credentialPresentation';
import { failureView, type FailureCode, type FailureView } from './walletMessages';
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
  | { type: 'resolved'; result: { ok: true; request: ResolvedPresentation } | WalletFailure | { ok: false; code: FailureCode } }
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

const BLOCKING: readonly CredentialStatus[] = ['revoked', 'suspended'];

/** Whether the selected document may be shared now, and if not, why. */
export function shareBlock(state: ConsentState): 'expired' | 'revoked' | 'suspended' | 'untrusted' | null {
  if (state.expired) return 'expired';
  const status = state.statuses[state.credentialId];
  if (status === 'revoked' || status === 'suspended') return status;
  if (state.untrusted !== null && state.untrusted !== 'confirmed') return 'untrusted';
  return null;
}

function firstChoice(request: ResolvedPresentation, statuses: Record<string, CredentialStatus> = {}): PresentationMatch {
  // A document that can be shared before one that is revoked or suspended.
  return request.matches.find((m) => !BLOCKING.includes(statuses[m.credentialId] ?? 'unknown')) ?? request.matches[0]!;
}

export function presentReducer(state: PresentState, event: PresentEvent): PresentState {
  switch (event.type) {
    case 'resolved': {
      if (state.phase !== 'resolving') return state;
      const result = event.result;
      if (!result.ok) {
        const failure = failureView(result.code);
        return { phase: 'refused', failure, retryLater: RETRY_LATER_CODES.has(failure.code) };
      }
      const request = result.request;
      if (request.matches.length === 0) {
        return { phase: 'no-match', request, documentNameKey: documentNameKeys[documentTypeOf(VCT.diploma)] };
      }
      const first = firstChoice(request);
      return {
        phase: 'consent', request, credentialId: first.credentialId, claimSetIndex: first.claimSets[0]!.index,
        untrusted: request.verifier.trusted ? null : 'warning', statuses: {}, refreshing: false, expired: false, failure: null,
      };
    }
    case 'statuses': {
      if (state.phase !== 'consent') return state;
      const statuses = { ...state.statuses, ...event.statuses };
      const current = statuses[state.credentialId];
      if (current && BLOCKING.includes(current)) {
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
      const failure = failureView(event.result.code);
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

export interface ClaimSetChoice {
  /** The claim set index to submit. */
  index: number;
  /** Shared in every option the verifier offers: cannot be left out (only declining avoids it). */
  required: ConsentField[];
  /** Shared in this option but not in every one. */
  optional: ConsentField[];
  /** Not requested at all: stays on the phone. */
  withheld: ConsentField[];
  /** The smaller option, when the verifier accepts one, and the fields it leaves out. */
  smaller: { index: number; dropped: ConsentField[] } | null;
  /** The verifier's first option, when this is not it. */
  fuller: { index: number; added: ConsentField[] } | null;
}

const labelKeyOf = (name: string): I18nKey | null => (Object.hasOwn(diplomaClaimLabelKeys, name) ? diplomaClaimLabelKeys[name as DiplomaClaim] : null);

/**
 * Required / optional / withheld fields of the chosen claim set, with the values that would leave
 * the phone (`claims`: the stored disclosures of the document, from credentials.get).
 */
export function claimSetChoice(match: PresentationMatch, claimSetIndex: number, vct: string, claims: Record<string, unknown>, locale: Locale): ClaimSetChoice {
  const display = new Map(displayClaims(vct, claims, locale).map((c) => [c.name as string, c]));
  const field = (name: string): ConsentField => ({ name, labelKey: labelKeyOf(name) ?? ('wallet.present.unknownField' as I18nKey), value: display.get(name)?.value ?? String(claims[name] ?? '') });
  const sets = match.claimSets;
  const chosen = sets.find((s) => s.index === claimSetIndex) ?? sets[0]!;
  const inAll = sets.reduce<string[]>((acc, s) => acc.filter((n) => s.claims.includes(n)), [...sets[0]!.claims]);
  const order = (names: string[]) => [...names].sort((a, b) => indexOfDisplay(a) - indexOfDisplay(b));
  const indexOfDisplay = (n: string) => {
    const i = [...display.keys()].indexOf(n);
    return i === -1 ? 999 : i;
  };
  const shared = new Set(chosen.claims);
  const smallest = sets.reduce((a, b) => (b.claims.length < a.claims.length ? b : a));
  const first = sets[0]!;
  return {
    index: chosen.index,
    required: order(chosen.claims.filter((n) => inAll.includes(n))).map(field),
    optional: order(chosen.claims.filter((n) => !inAll.includes(n))).map(field),
    withheld: order([...display.keys()].filter((n) => !shared.has(n))).map(field),
    smaller: smallest.claims.length < chosen.claims.length ? { index: smallest.index, dropped: order(chosen.claims.filter((n) => !smallest.claims.includes(n))).map(field) } : null,
    fuller: chosen.index !== first.index ? { index: first.index, added: order(first.claims.filter((n) => !shared.has(n))).map(field) } : null,
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
  outcome: 'success' | 'failed';
  t: (key: I18nKey, params?: Record<string, string>) => string;
}): ActivityLog {
  const { t } = input;
  const labels = input.claims.map((n) => t(labelKeyOf(n) ?? ('wallet.present.unknownField' as I18nKey)));
  return {
    id: input.id,
    timestamp: input.now.toISOString(),
    type: 'share',
    status: input.outcome,
    title: t(input.outcome === 'success' ? 'wallet.present.activity.sharedTitle' : 'wallet.present.activity.failedTitle', { document: t(input.documentNameKey) }),
    description: labels.join(', '),
    partner: input.verifierName ?? t('wallet.present.activity.unverifiedPartner'),
    credentialId: input.credentialId,
    sharedClaims: input.claims.filter((n) => /^[a-z_]{1,40}$/.test(n)),
    unread: false,
  };
}
