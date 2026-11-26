// What the wallet screens show, computed from SDK results. Pure: no React, no i18n hook.
import type { CredentialDetails, ResolvedOffer } from '@identra/sdk-app';
import type { Check } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import type { CredentialStatus } from '../../types';
import { credentialStatusFromVault, displayClaims, documentNameKeys, documentTypeOf, issuerDisplayName, type DisplayClaim } from './credentialPresentation';
import type { WalletCredentialSummary } from './walletContainer';
import { failedCheckKey } from './walletMessages';

export type Locale = 'vi' | 'en';

/**
 * Issuers the app knows by name and where a person asks them for a document again. Names are
 * data (an organisation's own name), not UI copy. ponytail: one sample issuer; the trust list
 * will name the rest once the SDK exposes its entries.
 */
/** The Identra website (one value for every link the app opens there). */
export const IDENTRA_WEBSITE_ORIGIN = 'https://identra.awncorp.vn';

export const knownIssuers: Record<string, { name: Record<Locale, string>; portalUrl: Record<Locale, string> }> = {
  'https://api-identra.awncorp.vn/issuers/truong-mau': {
    name: { vi: 'Trường Đại học Mẫu (DEMO)', en: 'Sample University (DEMO)' },
    portalUrl: { vi: `${IDENTRA_WEBSITE_ORIGIN}/vi/school-portal`, en: `${IDENTRA_WEBSITE_ORIGIN}/en/school-portal` },
  },
};

/** The issuer as a person reads it: the trusted name when known, else the known table, else the host. */
export function issuerLabel(issuerUri: string, trustedName: string | null | undefined, locale: Locale): string {
  return trustedName || knownIssuers[issuerUri]?.name[locale] || issuerDisplayName(issuerUri);
}

export type TrustPath = 'x509' | 'did';

/** Who issued a document and how the wallet recognised them (ADR-0020: two trust paths). */
export interface IssuerView {
  trustPath: TrustPath;
  /**
   * X.509: the name from Identra's trust list (else the known table, else the host). DID: the
   * complete issuer identifier (`issuerIdOf`), never a name (CertNet has none yet; the issuer's own
   * claim, its web origin and the known table, keyed by URL, are never used).
   */
  issuerName: string;
  /** DID path: the full identifier, for a person to compare; null on the X.509 path. */
  issuerDid: string | null;
}

/** The part of a CertNet identifier after `did:certnet:<network>:`, complete. */
export function issuerIdOf(did: string): string {
  return did.split(':').pop() ?? did;
}

/**
 * THE rule for showing an issuer identifier (ADR-0020). The registrant chooses it, so a shortened
 * form can be imitated: another recognised issuer can register an identifier with the same head and
 * tail, and on the DID path the identifier is the only issuer identity a screen shows.
 * - `complete`, wherever a person decides or relies on who the issuer is (the offer before
 *   receiving, the received screen, the share consent, the detail): always the whole identifier,
 *   wrapped, never shortened.
 * - `dense` (the list card, the wallet home): whole up to ISSUER_ID_DENSE_MAX characters (two lines
 *   of the card at 360 px); beyond, the first and last ISSUER_ID_KEEP characters around "…". The card
 *   opens the detail, which shows it whole.
 */
export type IssuerIdSurface = 'complete' | 'dense';
export const ISSUER_ID_KEEP = 20;
export const ISSUER_ID_DENSE_MAX = 2 * ISSUER_ID_KEEP + 1;

export function issuerIdText(id: string, surface: IssuerIdSurface): string {
  return surface === 'dense' && id.length > ISSUER_ID_DENSE_MAX ? `${id.slice(0, ISSUER_ID_KEEP)}…${id.slice(-ISSUER_ID_KEEP)}` : id;
}

export function issuerViewOf(s: { issuerUri: string; issuerName: string | null; trustPath?: TrustPath; issuerDid?: string | null }, locale: Locale): IssuerView {
  if (s.trustPath === 'did' || typeof s.issuerDid === 'string') {
    return { trustPath: 'did', issuerName: issuerIdOf(s.issuerDid ?? ''), issuerDid: s.issuerDid ?? null };
  }
  return { trustPath: 'x509', issuerName: issuerLabel(s.issuerUri, s.issuerName, locale), issuerDid: null };
}

/** The issuer line under a document's name: the name, or "Issuer ID <id>" on the DID path, shown by `issuerIdText`. */
export function issuerText(v: Pick<IssuerView, 'trustPath' | 'issuerName'>, t: (key: I18nKey, params?: Record<string, string>) => string, surface: IssuerIdSurface = 'complete'): string {
  return v.trustPath === 'did' ? t('wallet.trustPath.issuerId', { id: issuerIdText(v.issuerName, surface) }) : v.issuerName;
}

/** Whether the identifier belongs to a CertNet test network (local or testnet), which the screens say. */
export function isTestNetworkIssuer(v: Pick<IssuerView, 'issuerDid'>): boolean {
  const network = v.issuerDid?.split(':')[2];
  return network !== undefined && network !== 'mainnet';
}

/** How the issuer was checked, in a few words (the line under the issuer). */
export function trustPathKey(v: Pick<IssuerView, 'trustPath' | 'issuerDid'>): I18nKey {
  if (v.trustPath === 'x509') return 'wallet.trustPath.x509';
  return isTestNetworkIssuer(v) ? 'wallet.trustPath.didTest' : 'wallet.trustPath.did';
}

/**
 * What the detail's status block says after a check: the status meaning, then why when the last
 * check said so. For an `invalid` document the failed check (both paths, as before). For `unknown`
 * on the DID path the reason REPLACES the generic "the wallet could not reach the issuer": it was
 * CertNet, or the status list, that did not answer (before any re-check, when no checks are in hand,
 * a sentence that says so). Except when the build has no CertNet configuration: the SDK then answers
 * `unknown` with `did_resolution` failing DID_RESOLUTION_FAILED (with CertNet configured that
 * failure is `invalid`), and nothing was asked of CertNet.
 */
export function statusSentenceKeys(status: CredentialStatus, trustPath: TrustPath, checks: readonly Check[] | null): I18nKey[] {
  const meaning = `identity.detail.statuses.${status}.description` as I18nKey;
  const reason = failedCheckKey(checks);
  if (status === 'unknown' && trustPath === 'did' && checks?.some((c) => c.id === 'did_resolution' && !c.ok && c.code === 'DID_RESOLUTION_FAILED')) return ['wallet.didPath.unsupported'];
  if (status === 'invalid' && reason) return [meaning, reason];
  if (status === 'unknown' && trustPath === 'did') return [reason ?? 'wallet.didPath.notCheckedYet'];
  return [meaning];
}

export function issuerPortalUrl(issuerUri: string, locale: Locale): string | null {
  return knownIssuers[issuerUri]?.portalUrl[locale] ?? null;
}

/** Local calendar date: DD/MM/YYYY (vi), YYYY-MM-DD (en). '' for an invalid date. */
export function formatWalletDate(value: string | number | Date | null | undefined, locale: Locale): string {
  if (value === null || value === undefined) return '';
  const date = value instanceof Date ? value : new Date(typeof value === 'number' ? value * 1000 : value);
  if (Number.isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return locale === 'vi' ? `${dd}/${mm}/${yyyy}` : `${yyyy}-${mm}-${dd}`;
}

export interface OfferView {
  /**
   * From the issuer's own description, not yet checked against the trust list (the screen says so).
   * null for an issuer that declares a CertNet identifier: the DID path never shows a name (ADR-0020).
   */
  issuerName: string | null;
  /** The complete identifier the issuer declared (not verified until the document is accepted); null for a certificate issuer. */
  issuerId: string | null;
  /** The web origin the offer came from (new in the SDK; shown small under the name), or null. */
  issuerOrigin: string | null;
  documentNameKey: I18nKey;
  /** null: this offer needs no PIN. */
  pin: { length: number; numeric: boolean } | null;
}

/** The host of an https origin, for display; null for anything else. */
function originHost(origin: unknown): string | null {
  if (typeof origin !== 'string' || !origin.startsWith('https://')) return null;
  try {
    return new URL(origin).host || null;
  } catch {
    return null;
  }
}

function displayNameFor(entries: readonly { name: string; locale?: string }[], locale: Locale): string | null {
  return entries.find((d) => d.locale?.toLowerCase().startsWith(locale))?.name ?? entries[0]?.name ?? null;
}

export function offerView(offer: ResolvedOffer, locale: Locale): OfferView {
  const tx = offer.txCode;
  const did = typeof offer.issuerDid === 'string' && offer.issuerDid ? offer.issuerDid : null;
  return {
    issuerName: did ? null : (displayNameFor(offer.issuerDisplay, locale) ?? issuerLabel(offer.issuerUri, null, locale)),
    issuerId: did ? issuerIdOf(did) : null,
    issuerOrigin: originHost((offer as { issuerOrigin?: unknown }).issuerOrigin),
    documentNameKey: documentNameKeys[documentTypeOf(offer.configuration.vct)],
    pin: tx ? { length: tx.length && tx.length > 0 && tx.length <= 12 ? tx.length : 6, numeric: tx.inputMode === 'numeric' } : null,
  };
}

/** Digits only for a numeric PIN, trimmed to its length: what pasting or typing leaves in the field. */
export function sanitizePin(text: string, pin: OfferView['pin']): string {
  if (!pin) return '';
  return (pin.numeric ? text.replace(/\D/g, '') : text.replace(/\s/g, '')).slice(0, pin.length);
}

export interface CredentialListItem extends IssuerView {
  id: string;
  nameKey: I18nKey;
  receivedDate: string;
  status: CredentialStatus;
}

export function credentialListItem(summary: WalletCredentialSummary, locale: Locale): CredentialListItem {
  return {
    id: summary.id,
    nameKey: documentNameKeys[documentTypeOf(summary.vct)],
    ...issuerViewOf(summary, locale),
    receivedDate: formatWalletDate(summary.createdAt, locale),
    status: credentialStatusFromVault(summary.status),
  };
}

/** Newest first, so a document just received is on top. */
export function credentialListItems(summaries: readonly WalletCredentialSummary[], locale: Locale): CredentialListItem[] {
  return [...summaries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((s) => credentialListItem(s, locale));
}

export interface CredentialDetailView extends CredentialListItem {
  issuedDate: string;
  statusCheckedDate: string;
  fields: DisplayClaim[];
  /** Fields hidden behind "Hiện" when the hide-sensitive setting is on. */
  sensitiveFields: readonly string[];
  portalUrl: string | null;
}

const SENSITIVE: readonly string[] = ['ngay_sinh', 'ma_sinh_vien', 'so_hieu_bang'];

export function credentialDetailView(details: CredentialDetails, locale: Locale): CredentialDetailView {
  return {
    ...credentialListItem({ ...details, issuerName: details.issuerName }, locale),
    issuedDate: formatWalletDate(details.iat, locale),
    statusCheckedDate: formatWalletDate(details.statusCheckedAt, locale),
    fields: displayClaims(details.vct, details.claims, locale),
    sensitiveFields: SENSITIVE,
    portalUrl: issuerPortalUrl(details.issuerUri, locale),
  };
}

/** `•••` in place of a value, never revealing its length. */
export const MASKED_VALUE = '•••••';

/** What the detail screen prints for a field: the value, or the mask for a sensitive one until revealed. */
export function displayedValue(field: { name: string; value: string }, o: { hideSensitive: boolean; revealed: boolean; sensitiveFields: readonly string[] }): string {
  return o.hideSensitive && !o.revealed && o.sensitiveFields.includes(field.name) ? MASKED_VALUE : field.value;
}

export interface DocumentToRequestView {
  key: string;
  nameKey: I18nKey;
  issuerName: string;
  portalUrl: string | null;
}

export function documentsToRequestViews(items: readonly { vct: string; issuer: string }[], locale: Locale): DocumentToRequestView[] {
  return items.map((i) => ({
    key: JSON.stringify([i.vct, i.issuer]),
    nameKey: documentNameKeys[documentTypeOf(i.vct)],
    issuerName: issuerLabel(i.issuer, null, locale),
    portalUrl: issuerPortalUrl(i.issuer, locale),
  }));
}
