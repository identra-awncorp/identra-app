// Every code a wallet operation or a verification can end with → one sentence a person can act
// on (i18n keys; screens call t). Records keyed by the SDK's own unions, so a new SDK code does
// not compile until it has a sentence. No raw code ever reaches the screen.
import type { Check, CheckId, ErrorCode } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';

/** Codes the app adds: the start-up self-check failed; the wallet database was written by a newer app. */
export type AppWalletCode = 'DEVICE_UNSUPPORTED' | 'DATABASE_TOO_NEW';
/**
 * Codes the SDK is adding and the integration checkout does not have yet (read defensively until
 * then): `TX_CODE_REQUIRED` = a PIN is needed and none was given (local, nothing was sent).
 */
export type PendingSdkCode = 'TX_CODE_REQUIRED';
export type FailureCode = ErrorCode | AppWalletCode | PendingSdkCode;

/** What the person can do next. */
export type FailureAction = 'retry-pin' | 'retry' | 'scan-again' | 'contact-issuer' | 'request-again' | 'close';

export const failureSentenceKeys: Record<FailureCode, I18nKey> = {
  MALFORMED: 'wallet.errors.MALFORMED',
  TYP_INVALID: 'wallet.errors.TYP_INVALID',
  TOO_LARGE: 'wallet.errors.TOO_LARGE',
  ALG_NOT_ALLOWED: 'wallet.errors.ALG_NOT_ALLOWED',
  CERT_CHAIN_MALFORMED: 'wallet.errors.CERT_CHAIN_MALFORMED',
  CERT_CHAIN_UNTRUSTED: 'wallet.errors.CERT_CHAIN_UNTRUSTED',
  CERT_NOT_YET_VALID: 'wallet.errors.CERT_NOT_YET_VALID',
  CERT_EXPIRED: 'wallet.errors.CERT_EXPIRED',
  CERT_CONSTRAINT_INVALID: 'wallet.errors.CERT_CONSTRAINT_INVALID',
  CERT_KEY_NOT_ALLOWED: 'wallet.errors.CERT_KEY_NOT_ALLOWED',
  ISSUER_MISMATCH: 'wallet.errors.ISSUER_MISMATCH',
  SIGNATURE_INVALID: 'wallet.errors.SIGNATURE_INVALID',
  NOT_YET_VALID: 'wallet.errors.NOT_YET_VALID',
  EXPIRED: 'wallet.errors.EXPIRED',
  VCT_UNSUPPORTED: 'wallet.errors.VCT_UNSUPPORTED',
  ISSUER_NOT_TRUSTED: 'wallet.errors.ISSUER_NOT_TRUSTED',
  TRUST_LIST_UNAVAILABLE: 'wallet.errors.TRUST_LIST_UNAVAILABLE',
  REVOKED: 'wallet.errors.REVOKED',
  SUSPENDED: 'wallet.errors.SUSPENDED',
  STATUS_UNAVAILABLE: 'wallet.errors.STATUS_UNAVAILABLE',
  DISCLOSURE_INVALID: 'wallet.errors.DISCLOSURE_INVALID',
  KB_INVALID: 'wallet.errors.KB_INVALID',
  NONCE_MISMATCH: 'wallet.errors.NONCE_MISMATCH',
  AUD_MISMATCH: 'wallet.errors.AUD_MISMATCH',
  CHAIN_BROKEN: 'wallet.errors.CHAIN_BROKEN',
  CLIENT_ID_MISMATCH: 'wallet.errors.CLIENT_ID_MISMATCH',
  VERIFIER_NOT_TRUSTED: 'wallet.errors.VERIFIER_NOT_TRUSTED',
  DID_RESOLUTION_FAILED: 'wallet.errors.DID_RESOLUTION_FAILED',
  DID_RESOLUTION_UNAVAILABLE: 'wallet.errors.DID_RESOLUTION_UNAVAILABLE',
  KEY_NOT_FOUND: 'wallet.errors.KEY_NOT_FOUND',
  SKIPPED: 'wallet.errors.SKIPPED',
  OFFER_INVALID: 'wallet.errors.OFFER_INVALID',
  URL_NOT_ALLOWED: 'wallet.errors.URL_NOT_ALLOWED',
  TX_CODE_WRONG: 'wallet.errors.TX_CODE_WRONG',
  TX_CODE_REQUIRED: 'wallet.errors.TX_CODE_REQUIRED',
  OFFER_EXPIRED: 'wallet.errors.OFFER_EXPIRED',
  NETWORK_ERROR: 'wallet.errors.NETWORK_ERROR',
  ISSUER_ERROR: 'wallet.errors.ISSUER_ERROR',
  CREDENTIAL_INVALID: 'wallet.errors.CREDENTIAL_INVALID',
  CNF_MISMATCH: 'wallet.errors.CNF_MISMATCH',
  CLAIMS_INCOMPLETE: 'wallet.errors.CLAIMS_INCOMPLETE',
  STORAGE_ERROR: 'wallet.errors.STORAGE_ERROR',
  CREDENTIAL_NOT_FOUND: 'wallet.errors.CREDENTIAL_NOT_FOUND',
  QUERY_NOT_SATISFIED: 'wallet.errors.QUERY_NOT_SATISFIED',
  REQUEST_INVALID: 'wallet.errors.REQUEST_INVALID',
  REQUEST_EXPIRED: 'wallet.errors.REQUEST_EXPIRED',
  VERIFIER_ERROR: 'wallet.errors.VERIFIER_ERROR',
  KEY_INVALIDATED: 'wallet.errors.KEY_INVALIDATED',
  TOO_MANY_ATTEMPTS: 'wallet.errors.TOO_MANY_ATTEMPTS',
  USER_CANCELLED: 'wallet.errors.USER_CANCELLED',
  DEVICE_LOCKED: 'wallet.errors.DEVICE_LOCKED',
  DEVICE_UNSUPPORTED: 'wallet.errors.DEVICE_UNSUPPORTED',
  DATABASE_TOO_NEW: 'wallet.errors.DATABASE_TOO_NEW',
};

/** A check that failed without a code: which step, in plain words. */
export const checkSentenceKeys: Record<CheckId, I18nKey> = {
  structure: 'wallet.checks.structure',
  algorithm: 'wallet.checks.algorithm',
  certificate_chain: 'wallet.checks.certificate_chain',
  did_resolution: 'wallet.checks.did_resolution',
  signature: 'wallet.checks.signature',
  validity_time: 'wallet.checks.validity_time',
  credential_type: 'wallet.checks.credential_type',
  issuer_trust: 'wallet.checks.issuer_trust',
  status: 'wallet.checks.status',
  holder_binding: 'wallet.checks.holder_binding',
  product_chain: 'wallet.checks.product_chain',
  chain_format: 'wallet.checks.chain_format',
  chain_signatures: 'wallet.checks.chain_signatures',
  chain_validity: 'wallet.checks.chain_validity',
  chain_constraints: 'wallet.checks.chain_constraints',
  leaf_key: 'wallet.checks.leaf_key',
  issuer_uri: 'wallet.checks.issuer_uri',
  query: 'wallet.checks.query',
};

const actions: Partial<Record<FailureCode, FailureAction>> = {
  OFFER_INVALID: 'scan-again',
  URL_NOT_ALLOWED: 'scan-again',
  TX_CODE_WRONG: 'retry-pin',
  TX_CODE_REQUIRED: 'retry-pin',
  OFFER_EXPIRED: 'contact-issuer',
  NETWORK_ERROR: 'retry',
  DID_RESOLUTION_UNAVAILABLE: 'retry',
  ISSUER_ERROR: 'contact-issuer',
  CREDENTIAL_INVALID: 'contact-issuer',
  ISSUER_MISMATCH: 'contact-issuer',
  CNF_MISMATCH: 'contact-issuer',
  CLAIMS_INCOMPLETE: 'contact-issuer',
  STORAGE_ERROR: 'retry',
  KEY_INVALIDATED: 'request-again',
  TOO_MANY_ATTEMPTS: 'scan-again',
  KEY_NOT_FOUND: 'request-again',
  USER_CANCELLED: 'retry',
  DEVICE_LOCKED: 'retry',
};

export const failureTitleKeys: Record<FailureAction, I18nKey> = {
  'retry-pin': 'wallet.failureTitles.retryPin',
  retry: 'wallet.failureTitles.retry',
  'scan-again': 'wallet.failureTitles.scanAgain',
  'contact-issuer': 'wallet.failureTitles.contactIssuer',
  'request-again': 'wallet.failureTitles.requestAgain',
  close: 'wallet.failureTitles.close',
};

/** A title more precise than the action's, where the action's would say something untrue. */
const titleOverrides: Partial<Record<FailureCode, I18nKey>> = {
  TX_CODE_REQUIRED: 'wallet.failureTitles.pinNeeded',
};

export interface FailureView {
  code: FailureCode;
  action: FailureAction;
  titleKey: I18nKey;
  sentenceKey: I18nKey;
  /** For CREDENTIAL_INVALID: the first check that failed, in plain words. */
  detailKey: I18nKey | null;
}

const isFailureCode = (code: unknown): code is FailureCode => typeof code === 'string' && Object.hasOwn(failureSentenceKeys, code);

/**
 * On the DID path (ADR-0020) the issuer is recognised through CertNet, not Identra's list: the
 * sentences that name the list say CertNet there. The path is the SDK's own record: its checks
 * carry `did_resolution` in place of `certificate_chain`.
 */
const didPathSentenceKeys: Partial<Record<FailureCode, I18nKey>> = {
  ISSUER_NOT_TRUSTED: 'wallet.didPath.ISSUER_NOT_TRUSTED',
  TRUST_LIST_UNAVAILABLE: 'wallet.didPath.TRUST_LIST_UNAVAILABLE',
};
export const isDidPathChecks = (checks: readonly Check[] | null | undefined): boolean => !!checks?.some((c) => c.id === 'did_resolution');

/** The first check that failed (not skipped), in plain words worded for its trust path; null when none failed. */
export function failedCheckKey(checks: readonly Check[] | null | undefined): I18nKey | null {
  const failed = checks?.find((c) => !c.ok && !c.skipped);
  if (!failed) return null;
  if (!failed.code || !isFailureCode(failed.code)) return checkSentenceKeys[failed.id] ?? null;
  return (isDidPathChecks(checks) ? didPathSentenceKeys[failed.code] : undefined) ?? failureSentenceKeys[failed.code];
}

/** Any code (an unknown one included) → what the screen says. Unknown codes read as a storage problem. */
export function failureView(code: unknown, checks?: readonly Check[]): FailureView {
  const known: FailureCode = isFailureCode(code) ? code : 'STORAGE_ERROR';
  const action = actions[known] ?? 'close';
  const detailKey = known === 'CREDENTIAL_INVALID' ? failedCheckKey(checks) : null;
  return { code: known, action, titleKey: titleOverrides[known] ?? failureTitleKeys[action], sentenceKey: failureSentenceKeys[known], detailKey };
}

// ---------------------------------------------------------------- sharing (OpenID4VP)

/** Where a sharing failure happened: opening the requester's code, or signing and sending. */
export type PresentationStage = 'resolve' | 'submit';

/**
 * Sharing has its own sentences: a bad request is about the REQUESTER's code (never "the issuer's
 * signature", never "your document may have been altered"), a failed send is about delivery.
 * Keyed by every code like the tables above, so a new SDK code does not compile until it is worded.
 */
const REQUEST_BAD: I18nKey = 'wallet.presentErrors.requestBad';
const OTHER: I18nKey = 'wallet.presentErrors.other';
export const presentationSentenceKeys: Record<FailureCode, I18nKey> = {
  MALFORMED: REQUEST_BAD,
  TYP_INVALID: REQUEST_BAD,
  TOO_LARGE: REQUEST_BAD,
  ALG_NOT_ALLOWED: REQUEST_BAD,
  CERT_CHAIN_MALFORMED: REQUEST_BAD,
  CERT_CHAIN_UNTRUSTED: REQUEST_BAD,
  CERT_NOT_YET_VALID: REQUEST_BAD,
  CERT_EXPIRED: REQUEST_BAD,
  CERT_CONSTRAINT_INVALID: REQUEST_BAD,
  CERT_KEY_NOT_ALLOWED: REQUEST_BAD,
  SIGNATURE_INVALID: REQUEST_BAD,
  CLIENT_ID_MISMATCH: REQUEST_BAD,
  NONCE_MISMATCH: REQUEST_BAD,
  AUD_MISMATCH: REQUEST_BAD,
  REQUEST_INVALID: REQUEST_BAD,
  OFFER_INVALID: REQUEST_BAD,
  URL_NOT_ALLOWED: 'wallet.presentErrors.URL_NOT_ALLOWED',
  REQUEST_EXPIRED: 'wallet.presentErrors.REQUEST_EXPIRED',
  TRUST_LIST_UNAVAILABLE: 'wallet.presentErrors.TRUST_LIST_UNAVAILABLE',
  NETWORK_ERROR: 'wallet.presentErrors.NETWORK_ERROR',
  VERIFIER_ERROR: 'wallet.presentErrors.VERIFIER_ERROR',
  VERIFIER_NOT_TRUSTED: 'wallet.presentErrors.VERIFIER_NOT_TRUSTED',
  TOO_MANY_ATTEMPTS: 'wallet.errors.TOO_MANY_ATTEMPTS',
  USER_CANCELLED: 'wallet.presentErrors.USER_CANCELLED',
  DEVICE_LOCKED: 'wallet.presentErrors.DEVICE_LOCKED',
  STORAGE_ERROR: 'wallet.presentErrors.STORAGE_ERROR',
  KEY_INVALIDATED: 'wallet.errors.KEY_INVALIDATED',
  KEY_NOT_FOUND: 'wallet.errors.KEY_NOT_FOUND',
  CREDENTIAL_NOT_FOUND: 'wallet.errors.CREDENTIAL_NOT_FOUND',
  QUERY_NOT_SATISFIED: 'wallet.errors.QUERY_NOT_SATISFIED',
  DATABASE_TOO_NEW: 'wallet.errors.DATABASE_TOO_NEW',
  DEVICE_UNSUPPORTED: 'wallet.errors.DEVICE_UNSUPPORTED',
  // Codes of receiving or of checking a received document: not expected while sharing.
  ISSUER_MISMATCH: OTHER,
  NOT_YET_VALID: OTHER,
  EXPIRED: OTHER,
  VCT_UNSUPPORTED: OTHER,
  ISSUER_NOT_TRUSTED: OTHER,
  REVOKED: OTHER,
  SUSPENDED: OTHER,
  STATUS_UNAVAILABLE: OTHER,
  DISCLOSURE_INVALID: OTHER,
  KB_INVALID: OTHER,
  CHAIN_BROKEN: OTHER,
  DID_RESOLUTION_FAILED: OTHER,
  DID_RESOLUTION_UNAVAILABLE: OTHER,
  SKIPPED: OTHER,
  TX_CODE_WRONG: OTHER,
  TX_CODE_REQUIRED: OTHER,
  OFFER_EXPIRED: OTHER,
  ISSUER_ERROR: OTHER,
  CREDENTIAL_INVALID: OTHER,
  CNF_MISMATCH: OTHER,
  CLAIMS_INCOMPLETE: OTHER,
};

/** After "Chia sẻ" the same codes mean something else: the answer may have left the phone. */
const presentationSubmitSentenceKeys: Partial<Record<FailureCode, I18nKey>> = {
  NETWORK_ERROR: 'wallet.presentErrors.submit.NETWORK_ERROR',
  VERIFIER_ERROR: 'wallet.presentErrors.submit.VERIFIER_ERROR',
  REQUEST_INVALID: 'wallet.presentErrors.submit.REQUEST_INVALID',
  REQUEST_EXPIRED: 'wallet.presentErrors.submit.REQUEST_EXPIRED',
  STORAGE_ERROR: 'wallet.presentErrors.submit.STORAGE_ERROR',
};

/** Submit failures after which the answer may have reached the requester (the POST was attempted). */
export const MAYBE_SENT_CODES: ReadonlySet<FailureCode> = new Set(['NETWORK_ERROR', 'VERIFIER_ERROR']);

const sharedTitles: Partial<Record<FailureCode, I18nKey>> = {
  DEVICE_LOCKED: 'wallet.presentTitles.deviceLocked',
  USER_CANCELLED: 'wallet.presentTitles.cancelled',
  KEY_INVALIDATED: 'wallet.failureTitles.requestAgain',
  KEY_NOT_FOUND: 'wallet.failureTitles.requestAgain',
};
const presentationTitleKeys: Record<PresentationStage, { byCode: Partial<Record<FailureCode, I18nKey>>; otherwise: I18nKey }> = {
  resolve: {
    byCode: {
      ...sharedTitles,
      TRUST_LIST_UNAVAILABLE: 'wallet.presentTitles.checkLater',
      NETWORK_ERROR: 'wallet.presentTitles.checkLater',
      VERIFIER_ERROR: 'wallet.presentTitles.requesterNoAnswer',
      STORAGE_ERROR: 'wallet.presentTitles.walletNotOpened',
      DATABASE_TOO_NEW: 'wallet.presentTitles.walletNotOpened',
    },
    otherwise: 'wallet.presentTitles.requestBad',
  },
  submit: {
    byCode: {
      ...sharedTitles,
      NETWORK_ERROR: 'wallet.presentTitles.maybeSent',
      VERIFIER_ERROR: 'wallet.presentTitles.maybeSent',
      REQUEST_EXPIRED: 'wallet.presentTitles.requestExpired',
      REQUEST_INVALID: 'wallet.presentTitles.requestClosed',
      STORAGE_ERROR: 'wallet.presentTitles.notSigned',
    },
    otherwise: 'wallet.presentTitles.notSent',
  },
};

/** A sharing failure → what the consent screen says, worded for the stage it happened in. */
export function presentationFailureView(code: unknown, stage: PresentationStage): FailureView {
  const base = failureView(code);
  const titles = presentationTitleKeys[stage];
  const maybeSent = stage === 'submit' && MAYBE_SENT_CODES.has(base.code);
  return {
    code: base.code,
    action: maybeSent ? 'scan-again' : base.action,
    titleKey: titles.byCode[base.code] ?? titles.otherwise,
    sentenceKey: (stage === 'submit' ? presentationSubmitSentenceKeys[base.code] : undefined) ?? presentationSentenceKeys[base.code],
    detailKey: null,
  };
}

/** A thrown error (SecretStorageError, WalletKeyError, WalletDatabaseError, anything) → a failure code, as the SDK maps them. */
export function failureCodeOfError(error: unknown): FailureCode {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'KEY_INVALIDATED' || code === 'KEY_NOT_FOUND') return code;
  if (code === 'CANCELLED') return 'USER_CANCELLED';
  if (code === 'LOCKED') return 'DEVICE_LOCKED';
  if (code === 'SCHEMA_TOO_NEW') return 'DATABASE_TOO_NEW';
  return 'STORAGE_ERROR';
}
