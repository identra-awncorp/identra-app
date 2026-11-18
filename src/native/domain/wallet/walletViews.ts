// What the wallet screens show, computed from SDK results. Pure: no React, no i18n hook.
import type { CredentialDetails, ResolvedOffer } from '@identra/sdk-app';

import type { I18nKey } from '../../i18n';
import type { CredentialStatus } from '../../types';
import { credentialStatusFromVault, displayClaims, documentNameKeys, documentTypeOf, issuerDisplayName, type DisplayClaim } from './credentialPresentation';
import type { WalletCredentialSummary } from './walletContainer';

export type Locale = 'vi' | 'en';

/**
 * Issuers the app knows by name and where a person asks them for a document again. Names are
 * data (an organisation's own name), not UI copy. ponytail: one sample issuer; the trust list
 * will name the rest once the SDK exposes its entries.
 */
export const knownIssuers: Record<string, { name: Record<Locale, string>; portalUrl: Record<Locale, string> }> = {
  'https://api-identra.awncorp.vn/issuers/truong-mau': {
    name: { vi: 'Trường Mẫu', en: 'Sample University' },
    portalUrl: { vi: 'https://www.identra.id.vn/vi/school-portal', en: 'https://www.identra.id.vn/en/school-portal' },
  },
};

/** The issuer as a person reads it: the trusted name when known, else the known table, else the host. */
export function issuerLabel(issuerUri: string, trustedName: string | null | undefined, locale: Locale): string {
  return trustedName || knownIssuers[issuerUri]?.name[locale] || issuerDisplayName(issuerUri);
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
  /** From the issuer's own description, not yet checked against the trust list (the screen says so). */
  issuerName: string;
  documentNameKey: I18nKey;
  /** null: this offer needs no PIN. */
  pin: { length: number; numeric: boolean } | null;
}

function displayNameFor(entries: readonly { name: string; locale?: string }[], locale: Locale): string | null {
  return entries.find((d) => d.locale?.toLowerCase().startsWith(locale))?.name ?? entries[0]?.name ?? null;
}

export function offerView(offer: ResolvedOffer, locale: Locale): OfferView {
  const tx = offer.txCode;
  return {
    issuerName: displayNameFor(offer.issuerDisplay, locale) ?? issuerLabel(offer.issuerUri, null, locale),
    documentNameKey: documentNameKeys[documentTypeOf(offer.configuration.vct)],
    pin: tx ? { length: tx.length && tx.length > 0 && tx.length <= 12 ? tx.length : 6, numeric: tx.inputMode === 'numeric' } : null,
  };
}

/** Digits only for a numeric PIN, trimmed to its length: what pasting or typing leaves in the field. */
export function sanitizePin(text: string, pin: OfferView['pin']): string {
  if (!pin) return '';
  return (pin.numeric ? text.replace(/\D/g, '') : text.replace(/\s/g, '')).slice(0, pin.length);
}

export interface CredentialListItem {
  id: string;
  nameKey: I18nKey;
  issuerName: string;
  receivedDate: string;
  status: CredentialStatus;
}

export function credentialListItem(summary: WalletCredentialSummary, locale: Locale): CredentialListItem {
  return {
    id: summary.id,
    nameKey: documentNameKeys[documentTypeOf(summary.vct)],
    issuerName: issuerLabel(summary.issuerUri, summary.issuerName, locale),
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
