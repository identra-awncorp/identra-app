import { createMappedFetch, type HttpFetch } from '@identra/sdk-core';

export const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_MS = 60_000;
export const MAX_RESPONSE_BYTES = 256 * 1024;
/** The canonical origin of every Identra URL (identra-server CANONICAL_PUBLIC_BASE_URL). */
export const CANONICAL_API_ORIGIN = 'https://api-identra.awncorp.vn';

export type HttpFetchErrorCode = 'INSECURE_URL' | 'ORIGIN_NOT_ALLOWED' | 'TIMEOUT' | 'TOO_LARGE' | 'REDIRECT' | 'NETWORK';

/** Carries a code only: never the URL (it may hold request ids) or a body. */
export class HttpFetchError extends Error {
  readonly code: HttpFetchErrorCode;
  constructor(code: HttpFetchErrorCode) {
    super(`wallet http request failed: ${code}`);
    this.name = 'HttpFetchError';
    this.code = code;
  }
}

interface StreamReader {
  read(): Promise<{ done: boolean; value?: Uint8Array }>;
  cancel(): Promise<void>;
}

/** The part of a fetch Response this adapter reads (expo/fetch, RN whatwg-fetch and Node all fit). */
export interface FetchResponseLike {
  status: number;
  redirected?: boolean;
  headers: { get(name: string): string | null };
  body?: { getReader(): StreamReader } | null;
  text(): Promise<string>;
}

export type PlatformFetch = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
    signal: AbortSignal;
    redirect: 'manual';
    credentials: 'omit';
  },
) => Promise<FetchResponseLike>;

async function readCapped(response: FetchResponseLike, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader?.();
  if (!reader) {
    // No stream (RN's XHR-based fetch): the whole body is already in memory; check after.
    const text = await response.text();
    if (new TextEncoder().encode(text).length > maxBytes) throw new HttpFetchError('TOO_LARGE');
    return text;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new HttpFetchError('TOO_LARGE');
    }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(all);
}

/**
 * The SDK's HttpFetch on the platform fetch: https only (plus exactly the origins in
 * `insecureOrigins`, for a development API), redirects never followed (a 3xx is returned with an
 * empty body), no cookies, `timeoutMs` (default 10 s) covering request and body, and the per-call
 * `maxBytes` (at most 256 KB). The body is read eagerly so
 * the timer covers it; `text()` returns the cached string.
 */
export function createHttpFetch(options: { fetch: PlatformFetch; maxBytes?: number; insecureOrigins?: readonly string[] }): HttpFetch {
  const { fetch: platformFetch, maxBytes = MAX_RESPONSE_BYTES, insecureOrigins = [] } = options;
  return async (url, init = {}) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new HttpFetchError('INSECURE_URL');
    }
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && insecureOrigins.includes(parsed.origin))) {
      throw new HttpFetchError('INSECURE_URL');
    }
    const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('timeoutMs must be positive');

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, Math.min(timeoutMs, MAX_TIMEOUT_MS));
    try {
      const response = await platformFetch(url, {
        method: init.method ?? 'GET',
        // The native HTTP caches (URLCache on iOS) cannot be switched off from JS; ask for no-store.
        headers: { ...init.headers, 'cache-control': 'no-store' },
        ...(init.body !== undefined ? { body: init.body } : {}),
        signal: controller.signal,
        // A 3xx comes back as it is (HttpFetch contract); the SDK refuses it. Never followed.
        redirect: 'manual',
        credentials: 'omit',
      });
      // `redirected` means the platform followed one anyway: never trust that answer.
      if (response.redirected) throw new HttpFetchError('REDIRECT');
      const cap = Math.min(init.maxBytes ?? maxBytes, maxBytes);
      const declared = Number(response.headers.get('content-length'));
      if (Number.isFinite(declared) && declared > cap) throw new HttpFetchError('TOO_LARGE');
      const body = response.status >= 300 && response.status < 400 ? '' : await readCapped(response, cap);
      if (timedOut) throw new HttpFetchError('TIMEOUT');
      return { status: response.status, headers: { get: (name: string) => response.headers.get(name) }, text: async () => body };
    } catch (error) {
      if (timedOut) throw new HttpFetchError('TIMEOUT');
      if (error instanceof HttpFetchError) throw error;
      // expo/fetch rejects "Redirect is not allowed when redirect mode is 'error'".
      if (error instanceof Error && /redirect/i.test(error.message)) throw new HttpFetchError('REDIRECT');
      throw new HttpFetchError('NETWORK');
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * The wallet's HttpFetch. In a development build with EXPO_PUBLIC_IDENTRA_API_URL set, network
 * access to the canonical origin goes to that URL's origin (http allowed for exactly that origin);
 * identifiers stay canonical. Production builds never map.
 */
export function createWalletHttpFetch(options: { fetch: PlatformFetch; apiUrl?: string; production: boolean }): HttpFetch {
  const raw = options.apiUrl?.trim();
  if (options.production || !raw) return createHttpFetch({ fetch: options.fetch });
  const actual = new URL(raw.includes('://') ? raw : `http://${raw}`).origin;
  if (actual === CANONICAL_API_ORIGIN) return createHttpFetch({ fetch: options.fetch });
  return createMappedFetch(createHttpFetch({ fetch: options.fetch, insecureOrigins: [actual] }), { [CANONICAL_API_ORIGIN]: actual });
}

/**
 * The HttpFetch of the CertNet gateway clients (ADR-0020 §9): the same adapter (https only, no
 * redirect, no cookies, `timeoutMs`, `maxBytes`), and only URLs on the gateway's own origin.
 */
export function createGatewayHttpFetch(options: { fetch: PlatformFetch; gatewayUrl: string }): HttpFetch {
  const origin = new URL(options.gatewayUrl).origin;
  const inner = createHttpFetch({ fetch: options.fetch });
  return (url, init) => {
    let target: string;
    try {
      target = new URL(url).origin;
    } catch {
      return Promise.reject(new HttpFetchError('INSECURE_URL'));
    }
    return target === origin ? inner(url, init) : Promise.reject(new HttpFetchError('ORIGIN_NOT_ALLOWED'));
  };
}
