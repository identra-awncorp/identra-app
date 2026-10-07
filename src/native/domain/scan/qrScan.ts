export type IdentraQrPurpose = 'connection-invitation' | 'credential-presentation';

export type QrScanResult =
  | {
      expiresAt: string;
      kind: 'identra';
      purpose: IdentraQrPurpose;
      requestId: string;
    }
  | { kind: 'expired-identra'; purpose: IdentraQrPurpose }
  | { kind: 'invalid-identra' }
  | { kind: 'url'; secure: boolean; url: string }
  | { kind: 'text'; value: string };

const identraPurposes = new Set<IdentraQrPurpose>([
  'connection-invitation',
  'credential-presentation',
]);

export function parseQrScanValue(rawValue: string, nowMs = Date.now()): QrScanResult {
  const value = rawValue.trim();

  try {
    const url = new URL(value);

    if (url.protocol === 'identra:') {
      const purpose = url.hostname as IdentraQrPurpose;
      if (!identraPurposes.has(purpose)) return { kind: 'invalid-identra' };

      const requestId = url.searchParams.get('request')?.trim();
      const expiresAt = url.searchParams.get('expires')?.trim();
      const expiresAtMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;

      if (!requestId || !expiresAt || !Number.isFinite(expiresAtMs)) {
        return { kind: 'invalid-identra' };
      }

      if (expiresAtMs <= nowMs) {
        return { kind: 'expired-identra', purpose };
      }

      return { kind: 'identra', purpose, requestId, expiresAt };
    }

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return { kind: 'url', secure: url.protocol === 'https:', url: url.toString() };
    }
  } catch {
    // Non-URL QR values are handled as plain text below.
  }

  return { kind: 'text', value };
}
