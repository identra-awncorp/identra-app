export type IdentraQrPurpose = 'connection-invitation' | 'credential-presentation';

/** The two wallet hand-off kinds; only these reach the wallet container. */
export type WalletQrRequest =
  | { kind: 'credential-offer'; offerUri: string }
  | { kind: 'presentation-request'; clientId: string; requestUri: string; requestUriMethod?: 'get' | 'post' };

export type QrScanResult =
  | {
      expiresAt: string;
      kind: 'identra';
      purpose: IdentraQrPurpose;
      requestId: string;
    }
  | { kind: 'expired-identra'; purpose: IdentraQrPurpose }
  | { kind: 'invalid-identra' }
  | WalletQrRequest
  | { kind: 'invalid-wallet-request' }
  | { kind: 'url'; secure: boolean; url: string }
  | { kind: 'text'; value: string };

const identraPurposes = new Set<IdentraQrPurpose>([
  'connection-invitation',
  'credential-presentation',
]);

/** Wallet QR payloads above this length are refused (a by-reference offer or request is short). */
export const MAX_WALLET_QR_LENGTH = 2048;
const MAX_CLIENT_ID_LENGTH = 512;
const CREDENTIAL_OFFER_PREFIX = 'openid-credential-offer://';
const PRESENTATION_REQUEST_PREFIX = 'openid4vp://';
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/**
 * Strict query parsing for a wallet payload: `<prefix>?a=b&c=d` with nothing between the scheme
 * and `?`, no fragment, every name in `allowed`, no name twice, valid percent-encoding. Manual
 * (not URL/URLSearchParams) so Node and Expo's URL polyfill cannot disagree on a custom scheme.
 */
function parseWalletQuery(value: string, prefix: string, allowed: readonly string[]): Map<string, string> | null {
  const rest = value.slice(prefix.length);
  if (!rest.startsWith('?') || rest.includes('#') || rest.length === 1) return null;
  const params = new Map<string, string>();
  for (const pair of rest.slice(1).split('&')) {
    const eq = pair.indexOf('=');
    if (eq <= 0) return null;
    let name: string;
    let paramValue: string;
    try {
      name = decodeURIComponent(pair.slice(0, eq).replace(/\+/g, ' '));
      paramValue = decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '));
    } catch {
      return null;
    }
    if (!allowed.includes(name) || params.has(name)) return null;
    params.set(name, paramValue);
  }
  return params;
}

/** The normalised https URL, or null for anything else (http, javascript:, credentials in the URL, garbage). */
function httpsUrl(value: string | undefined): string | null {
  if (!value || CONTROL_CHARS.test(value) || !value.startsWith('https://')) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseCredentialOffer(value: string): QrScanResult {
  // By reference only: `credential_offer` by value is refused, as is any other parameter.
  const params = parseWalletQuery(value, CREDENTIAL_OFFER_PREFIX, ['credential_offer_uri']);
  const offerUri = httpsUrl(params?.get('credential_offer_uri'));
  return offerUri ? { kind: 'credential-offer', offerUri } : { kind: 'invalid-wallet-request' };
}

function parsePresentationRequest(value: string): QrScanResult {
  const params = parseWalletQuery(value, PRESENTATION_REQUEST_PREFIX, ['client_id', 'request_uri', 'request_uri_method']);
  if (!params) return { kind: 'invalid-wallet-request' };
  const clientId = params.get('client_id');
  const requestUri = httpsUrl(params.get('request_uri'));
  const method = params.get('request_uri_method');
  if (!clientId || clientId.length > MAX_CLIENT_ID_LENGTH || CONTROL_CHARS.test(clientId) || !requestUri) {
    return { kind: 'invalid-wallet-request' };
  }
  if (method !== undefined && method !== 'get' && method !== 'post') return { kind: 'invalid-wallet-request' };
  return { kind: 'presentation-request', clientId, requestUri, ...(method ? { requestUriMethod: method } : {}) };
}

/** The exact QR form the wallet SDK takes, rebuilt from a strictly parsed offer URL. */
export function credentialOfferQrText(offerUri: string): string {
  return `${CREDENTIAL_OFFER_PREFIX}?credential_offer_uri=${encodeURIComponent(offerUri)}`;
}

/** The QR form the wallet SDK takes for a presentation request, rebuilt from the parsed parts. */
export function presentationRequestQrText(request: { clientId: string; requestUri: string; requestUriMethod?: 'get' | 'post' }): string {
  const method = request.requestUriMethod ? `&request_uri_method=${request.requestUriMethod}` : '';
  return `${PRESENTATION_REQUEST_PREFIX}?client_id=${encodeURIComponent(request.clientId)}&request_uri=${encodeURIComponent(request.requestUri)}${method}`;
}

export function parseQrScanValue(rawValue: string, nowMs = Date.now()): QrScanResult {
  const value = rawValue.trim();

  // Wallet schemes are matched case-sensitively: a mixed-case scheme is refused, not recognised.
  const lower = value.slice(0, CREDENTIAL_OFFER_PREFIX.length).toLowerCase();
  const isOffer = lower.startsWith(CREDENTIAL_OFFER_PREFIX);
  const isRequest = lower.startsWith(PRESENTATION_REQUEST_PREFIX);
  if (isOffer || isRequest) {
    if (value.length > MAX_WALLET_QR_LENGTH) return { kind: 'invalid-wallet-request' };
    if (value.startsWith(CREDENTIAL_OFFER_PREFIX)) return parseCredentialOffer(value);
    if (value.startsWith(PRESENTATION_REQUEST_PREFIX)) return parsePresentationRequest(value);
    return { kind: 'invalid-wallet-request' };
  }

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
