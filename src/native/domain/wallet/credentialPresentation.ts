// Display metadata for real credentials (ADR-0009 §6): vct → document name, claim labels in
// display order, value formatting and status mapping. Returns i18n keys; screens call t(...).
// No technical term (vct, issuer URL, SD-JWT) reaches the user through these keys.
import type { StoredCredentialStatus, WalletCredentialStatus } from '@identra/sdk-app';
import { DIPLOMA_CLAIMS, VCT } from '@identra/sdk-core';

import type { I18nKey } from '../../i18n';
import type { CredentialStatus } from '../../types';

export type DocumentType = 'diploma' | 'productEvent' | 'unknown';
export type DiplomaClaim = (typeof DIPLOMA_CLAIMS)[number];

export function documentTypeOf(vct: string): DocumentType {
  if (vct === VCT.diploma) return 'diploma';
  if (vct === VCT.productEvent) return 'productEvent';
  return 'unknown';
}

export const documentNameKeys: Record<DocumentType, I18nKey> = {
  diploma: 'wallet.documentTypes.diploma',
  productEvent: 'wallet.documentTypes.productEvent',
  unknown: 'wallet.documentTypes.unknown',
};

export const diplomaClaimLabelKeys: Record<DiplomaClaim, I18nKey> = {
  ho_ten: 'wallet.claims.ho_ten',
  ngay_sinh: 'wallet.claims.ngay_sinh',
  ma_sinh_vien: 'wallet.claims.ma_sinh_vien',
  nganh: 'wallet.claims.nganh',
  hang_tot_nghiep: 'wallet.claims.hang_tot_nghiep',
  nam_tot_nghiep: 'wallet.claims.nam_tot_nghiep',
  so_hieu_bang: 'wallet.claims.so_hieu_bang',
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` → `DD/MM/YYYY` (vi) or unchanged ISO (en); null when not a real calendar date. */
export function formatClaimDate(value: string, locale: 'vi' | 'en'): string | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (date.getUTCFullYear() !== Number(y) || date.getUTCMonth() !== Number(m) - 1 || date.getUTCDate() !== Number(d)) return null;
  return locale === 'vi' ? `${d}/${m}/${y}` : value;
}

export interface DisplayClaim {
  name: DiplomaClaim;
  labelKey: I18nKey;
  value: string;
}

/**
 * The disclosed diploma claims in display order, string values only (a claim not disclosed is
 * simply absent). Other credential types have no field table yet and return [].
 */
export function displayClaims(vct: string, claims: Record<string, unknown>, locale: 'vi' | 'en'): DisplayClaim[] {
  if (documentTypeOf(vct) !== 'diploma') return [];
  const out: DisplayClaim[] = [];
  for (const name of DIPLOMA_CLAIMS) {
    const raw = claims[name];
    if (typeof raw !== 'string' && typeof raw !== 'number') continue;
    const text = String(raw);
    out.push({ name, labelKey: diplomaClaimLabelKeys[name], value: name === 'ngay_sinh' ? (formatClaimDate(text, locale) ?? text) : text });
  }
  return out;
}

/** The app status of a credential: the wallet API's (`unknown`) or the vault column's (`unavailable`). */
export function credentialStatusFromVault(status: StoredCredentialStatus | WalletCredentialStatus | 'invalid' | null): CredentialStatus {
  switch (status) {
    case 'invalid':
      // Coming in the SDK: the document no longer passes its checks (not "could not check").
      return 'invalid';
    case 'valid':
      return 'verified';
    case 'revoked':
      return 'revoked';
    case 'suspended':
      return 'suspended';
    case 'unavailable':
    case 'unknown':
    case null:
      return 'unknown';
  }
}

/** Issuer shown to the user: the host of the issuer URL, never the URL itself. */
export function issuerDisplayName(issuer: string): string {
  try {
    return new URL(issuer).hostname || issuer;
  } catch {
    return issuer;
  }
}

export interface DocumentToRequest {
  vct: string;
  issuer: string;
  nameKey: I18nKey;
  issuerName: string;
}

/** Restore-screen rows for the catalogue items to request again. */
export function documentsToRequest(items: readonly { vct: string; issuer: string }[]): DocumentToRequest[] {
  return items.map((i) => ({ vct: i.vct, issuer: i.issuer, nameKey: documentNameKeys[documentTypeOf(i.vct)], issuerName: issuerDisplayName(i.issuer) }));
}
