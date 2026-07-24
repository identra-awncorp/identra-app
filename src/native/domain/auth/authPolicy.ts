const DEFINITIVE_SESSION_FAILURE_CODES = new Set([
  'INVALID_REFRESH_TOKEN',
  'REFRESH_TOKEN_EXPIRED',
  'SESSION_REVOKED',
  'TOKEN_REVOKED',
  'UNAUTHORIZED',
]);

export function shouldInvalidateStoredAuthSession(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const failure = error as { code?: unknown; status?: unknown };
  if (failure.status === 401) {
    return true;
  }

  return (
    typeof failure.code === 'string' &&
    DEFINITIVE_SESSION_FAILURE_CODES.has(failure.code.trim().toUpperCase())
  );
}

export function summarizeAuthPayload(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return {
      kind: 'array',
      length: value.length,
    };
  }

  if (typeof value === 'object') {
    return {
      fields: Object.keys(value as Record<string, unknown>).sort(),
      kind: 'object',
    };
  }

  return {
    kind: typeof value,
  };
}

export function isProductionApiUrlSecure(rawUrl: string): boolean {
  const urlWithScheme = rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`;

  try {
    return new URL(urlWithScheme).protocol === 'https:';
  } catch {
    return false;
  }
}
