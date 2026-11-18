// Every code a wallet operation or a verification can end with → one sentence a person can act
// on (i18n keys; screens call t). Records keyed by the SDK's own unions, so a new SDK code does
// not compile until it has a sentence. No raw code ever reaches the screen.
import type { Check, CheckId, ErrorCode } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';

/** The one code the app adds: the start-up self-check failed. */
export type AppWalletCode = 'DEVICE_UNSUPPORTED';
export type FailureCode = ErrorCode | AppWalletCode;

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
  KEY_NOT_FOUND: 'wallet.errors.KEY_NOT_FOUND',
  SKIPPED: 'wallet.errors.SKIPPED',
  OFFER_INVALID: 'wallet.errors.OFFER_INVALID',
  URL_NOT_ALLOWED: 'wallet.errors.URL_NOT_ALLOWED',
  TX_CODE_WRONG: 'wallet.errors.TX_CODE_WRONG',
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
  USER_CANCELLED: 'wallet.errors.USER_CANCELLED',
  DEVICE_LOCKED: 'wallet.errors.DEVICE_LOCKED',
  DEVICE_UNSUPPORTED: 'wallet.errors.DEVICE_UNSUPPORTED',
};

/** A check that failed without a code: which step, in plain words. */
export const checkSentenceKeys: Record<CheckId, I18nKey> = {
  structure: 'wallet.checks.structure',
  algorithm: 'wallet.checks.algorithm',
  certificate_chain: 'wallet.checks.certificate_chain',
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
  OFFER_EXPIRED: 'contact-issuer',
  NETWORK_ERROR: 'retry',
  ISSUER_ERROR: 'contact-issuer',
  CREDENTIAL_INVALID: 'contact-issuer',
  ISSUER_MISMATCH: 'contact-issuer',
  CNF_MISMATCH: 'contact-issuer',
  CLAIMS_INCOMPLETE: 'contact-issuer',
  STORAGE_ERROR: 'retry',
  KEY_INVALIDATED: 'request-again',
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

export interface FailureView {
  code: FailureCode;
  action: FailureAction;
  titleKey: I18nKey;
  sentenceKey: I18nKey;
  /** For CREDENTIAL_INVALID: the first check that failed, in plain words. */
  detailKey: I18nKey | null;
}

const isFailureCode = (code: unknown): code is FailureCode => typeof code === 'string' && Object.hasOwn(failureSentenceKeys, code);

/** Any code (an unknown one included) → what the screen says. Unknown codes read as a storage problem. */
export function failureView(code: unknown, checks?: readonly Check[]): FailureView {
  const known: FailureCode = isFailureCode(code) ? code : 'STORAGE_ERROR';
  const action = actions[known] ?? 'close';
  let detailKey: I18nKey | null = null;
  if (known === 'CREDENTIAL_INVALID') {
    const failed = checks?.find((c) => !c.ok && !c.skipped);
    if (failed) detailKey = failed.code && isFailureCode(failed.code) ? failureSentenceKeys[failed.code] : checkSentenceKeys[failed.id];
  }
  return { code: known, action, titleKey: failureTitleKeys[action], sentenceKey: failureSentenceKeys[known], detailKey };
}

/** A thrown error (SecretStorageError, WalletKeyError, WalletDatabaseError, anything) → a failure code, as the SDK maps them. */
export function failureCodeOfError(error: unknown): FailureCode {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === 'KEY_INVALIDATED' || code === 'KEY_NOT_FOUND') return code;
  if (code === 'CANCELLED') return 'USER_CANCELLED';
  if (code === 'LOCKED') return 'DEVICE_LOCKED';
  return 'STORAGE_ERROR';
}
