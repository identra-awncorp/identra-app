import type { CredentialAttribute } from '../../types';

export const TEMPORARY_QR_TTL_MS = 3 * 60 * 1000;

export type TemporaryQrPurpose = 'credential-presentation' | 'connection-invitation';

export interface TemporaryQrReference {
  expiresAt: string;
  requestId: string;
  type: 'identra-temporary-reference';
  purpose: TemporaryQrPurpose;
  version: 1;
}

function createRequestId(nowMs: number): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return randomUuid;
  }

  const randomPart = Math.random().toString(36).slice(2);
  return `${nowMs.toString(36)}-${randomPart}`;
}

export function createTemporaryQrReference({
  createdAt,
  purpose,
  requestId = createRequestId(createdAt),
  ttlMs = TEMPORARY_QR_TTL_MS,
}: {
  createdAt: number;
  purpose: TemporaryQrPurpose;
  requestId?: string;
  ttlMs?: number;
}): TemporaryQrReference {
  if (!Number.isFinite(createdAt) || !Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw new Error('Temporary QR timestamps must be finite and the TTL must be positive.');
  }

  return {
    type: 'identra-temporary-reference',
    version: 1,
    purpose,
    requestId,
    expiresAt: new Date(createdAt + ttlMs).toISOString(),
  };
}

export function serializeTemporaryQrReference(reference: TemporaryQrReference): string {
  const params = new URLSearchParams({
    request: reference.requestId,
    expires: reference.expiresAt,
  });
  return `identra://${reference.purpose}?${params.toString()}`;
}

export function getTemporaryQrRemainingSeconds(
  createdAt: number,
  nowMs: number,
  ttlMs = TEMPORARY_QR_TTL_MS,
): number {
  return Math.max(0, Math.ceil((createdAt + ttlMs - nowMs) / 1000));
}

export function isTemporaryQrReferenceExpired(reference: TemporaryQrReference, nowMs: number): boolean {
  const expiresAt = Date.parse(reference.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= nowMs;
}

export function selectApprovedCredentialAttributes(
  attributes: CredentialAttribute[],
  approvedKeys: string[],
): CredentialAttribute[] {
  const approved = new Set(approvedKeys);
  return attributes
    .filter((attribute) => approved.has(attribute.key))
    .map((attribute) => ({ ...attribute }));
}
