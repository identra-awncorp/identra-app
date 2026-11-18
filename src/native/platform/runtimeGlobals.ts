// Runtime globals the wallet SDK needs (ADR-0004 "Bổ sung 2026-11-19", sdk-app README).
// Pure: the caller passes the global object, so tests can use a fake one.
//
// What Expo SDK 56 / RN 0.85 / Hermes V1 provide before the app entry runs:
// - Hermes itself: TextEncoder, atob, btoa, BigInt (probed on a Hermes VM built from tag
//   hermes-v250829098.0.10, the version node_modules/hermes-compiler pins).
// - react-native/Libraries/Core/setUpXHR.js: fetch, Headers, Request, Response, AbortController,
//   URL and URLSearchParams (both replaced by Expo below).
// - expo/src/winter/runtime.native.ts (run before the main module by @expo/metro-config's
//   getModulesRunBeforeMainModule): TextDecoder, URL, URLSearchParams, structuredClone, and an
//   expo/fetch `fetch` that honours `redirect`, `credentials` and AbortSignal.
// Missing: `crypto.getRandomValues` only. installRandomValues fills that one gap.

export type RandomValuesFn = <T extends Uint8Array>(array: T) => T;

/**
 * Installs `crypto.getRandomValues` when absent. Never replaces an existing implementation and
 * never adds `crypto.subtle` (the SDK must not find a fake one). Returns whether it installed.
 */
export function installRandomValues(target: Record<string, unknown>, getRandomValues: RandomValuesFn): boolean {
  const existing = target.crypto as { getRandomValues?: unknown } | undefined;
  if (typeof existing?.getRandomValues === 'function') return false;
  const cryptoObject = existing && typeof existing === 'object' ? existing : {};
  Object.defineProperty(cryptoObject, 'getRandomValues', {
    configurable: true,
    enumerable: true,
    value: getRandomValues,
    writable: false,
  });
  if (!existing) {
    Object.defineProperty(target, 'crypto', { configurable: true, enumerable: false, value: cryptoObject, writable: false });
  }
  return true;
}

export const REQUIRED_GLOBAL_FUNCTIONS = [
  'TextEncoder',
  'TextDecoder',
  'atob',
  'btoa',
  'URL',
  'URLSearchParams',
  'Headers',
  'Response',
  'structuredClone',
  'fetch',
  'AbortController',
  'BigInt',
] as const;

export type RuntimeProblem =
  | { kind: 'missing-global'; name: string }
  | { kind: 'random-unavailable' }
  | { kind: 'random-constant' }
  | { kind: 'text-codec-broken' }
  | { kind: 'url-broken' };

export type RuntimeCheckResult = { ok: true } | { ok: false; problems: RuntimeProblem[] };

function allEqual(bytes: Uint8Array): boolean {
  return bytes.every((b) => b === bytes[0]);
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Start-up self-check: every required global exists, the random source gives non-constant
 * output, UTF-8 round-trips with a fatal decoder, and URL exposes searchParams (React Native's
 * own URL polyfill does not). Never throws; the UI shows a blocking state when not ok.
 */
export function checkWalletRuntime(g: Record<string, unknown> = globalThis as unknown as Record<string, unknown>): RuntimeCheckResult {
  const problems: RuntimeProblem[] = [];
  for (const name of REQUIRED_GLOBAL_FUNCTIONS) {
    if (typeof g[name] !== 'function') problems.push({ kind: 'missing-global', name });
  }

  const getRandomValues = (g.crypto as { getRandomValues?: unknown } | undefined)?.getRandomValues;
  if (typeof getRandomValues !== 'function') {
    problems.push({ kind: 'random-unavailable' });
  } else {
    try {
      const a = new Uint8Array(32);
      const b = new Uint8Array(32);
      getRandomValues.call(g.crypto, a);
      getRandomValues.call(g.crypto, b);
      if (allEqual(a) || allEqual(b) || sameBytes(a, b)) problems.push({ kind: 'random-constant' });
    } catch {
      problems.push({ kind: 'random-unavailable' });
    }
  }

  if (typeof g.TextEncoder === 'function' && typeof g.TextDecoder === 'function') {
    try {
      const sample = 'Họ và tên ✓';
      const Encoder = g.TextEncoder as typeof TextEncoder;
      const Decoder = g.TextDecoder as typeof TextDecoder;
      const decoder = new Decoder('utf-8', { fatal: true });
      if (decoder.decode(new Encoder().encode(sample)) !== sample) throw new Error('mismatch');
      let rejectsBadInput = false;
      try {
        decoder.decode(Uint8Array.of(0xc3, 0x28));
      } catch {
        rejectsBadInput = true;
      }
      if (!rejectsBadInput) throw new Error('not fatal');
    } catch {
      problems.push({ kind: 'text-codec-broken' });
    }
  }

  if (typeof g.URL === 'function') {
    try {
      const url = new (g.URL as typeof URL)('https://example.test/path?a=1&b=2');
      if (url.protocol !== 'https:' || url.hostname !== 'example.test' || url.searchParams.get('b') !== '2') throw new Error('mismatch');
    } catch {
      problems.push({ kind: 'url-broken' });
    }
  }

  return problems.length === 0 ? { ok: true } : { ok: false, problems };
}
