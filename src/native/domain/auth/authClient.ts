import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  clearStoredAuthSession,
  loadStoredDeviceId,
  saveStoredAuthSession,
  saveStoredDeviceId,
  type StoredAuthSession,
} from './authSessionStorage';

export interface AuthDevice {
  appVersion?: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
}

export interface AuthChallenge {
  challengeId: string;
  delivery?: {
    channel: string;
    demoOtp?: string;
    provider: string;
    to: string;
  };
  deviceKnown?: boolean;
  expiresAt: string;
  maxAttempts: number;
  phone: string;
  purpose: 'login' | 'register';
  resendAvailableAt: string;
  requiresOtp?: boolean;
}

export interface AuthUser {
  fullName: string | null;
  id: string;
  phone: string;
  phoneVerifiedAt: string | null;
}

export interface AuthDeviceSession {
  appVersion?: string;
  deviceId: string;
  deviceName?: string;
  expiresAt: string;
  id: string;
  lastSeenAt: string | null;
  platform?: string;
  revokedAt: string | null;
  trustedAt: string | null;
  trustRevokedAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresAt: string;
  expiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  tokenType: string;
}

export interface AuthSuccess {
  session: AuthDeviceSession;
  tokens: AuthTokens;
  user: AuthUser;
}

export interface RegistrationVerification {
  registration: {
    nextAction: 'SET_PASSWORD';
    registrationToken: string;
    registrationTokenExpiresAt: string;
  };
  user: AuthUser;
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiErrorBody {
  code?: string;
  error?: string;
  message?: string | string[];
  statusCode?: number;
}

const AUTH_REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_API_PREFIX = 'v1';

export class IdentraAuthError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = 'AUTH_REQUEST_FAILED', status?: number) {
    super(message);
    this.name = 'IdentraAuthError';
    this.code = code;
    this.status = status;
  }
}

export async function getAuthDevice(): Promise<AuthDevice> {
  const storedDeviceId = await loadStoredDeviceId();
  const deviceId = storedDeviceId ?? createDeviceId();

  if (!storedDeviceId) {
    await saveStoredDeviceId(deviceId);
  }

  return {
    appVersion: getAppVersion(),
    deviceId,
    deviceName: getDeviceName(),
    platform: Platform.OS,
  };
}

export async function startRegistration(phone: string): Promise<AuthChallenge> {
  const device = await getAuthDevice();
  const response = await requestJson<ApiEnvelope<AuthChallenge>>('/auth/register/start', {
    body: { device, phone },
    method: 'POST',
  });

  return response.data;
}

export async function verifyRegistration(input: {
  challengeId: string;
  fullName?: string;
  otpCode: string;
  phone: string;
}): Promise<RegistrationVerification> {
  const device = await getAuthDevice();
  const response = await requestJson<ApiEnvelope<RegistrationVerification>>('/auth/register/verify', {
    body: { ...input, device },
    method: 'POST',
  });

  return response.data;
}

export async function setRegistrationPassword(input: {
  password: string;
  registrationToken: string;
}): Promise<AuthSuccess> {
  const device = await getAuthDevice();
  const response = await requestJson<ApiEnvelope<AuthSuccess>>('/auth/register/password', {
    body: { ...input, device },
    method: 'POST',
  });

  return response.data;
}

export async function startLogin(input: {
  password: string;
  phone: string;
}): Promise<AuthChallenge | AuthSuccess> {
  const device = await getAuthDevice();
  const response = await requestJson<ApiEnvelope<AuthChallenge | AuthSuccess>>('/auth/login/start', {
    body: { ...input, device },
    method: 'POST',
  });

  return response.data;
}

export async function verifyLogin(input: {
  challengeId: string;
  otpCode: string;
  phone: string;
}): Promise<AuthSuccess> {
  const device = await getAuthDevice();
  const response = await requestJson<ApiEnvelope<AuthSuccess>>('/auth/login/verify', {
    body: { ...input, device },
    method: 'POST',
  });

  return response.data;
}

export async function refreshAuthSession(stored: StoredAuthSession): Promise<AuthSuccess> {
  const response = await requestJson<ApiEnvelope<AuthSuccess>>('/auth/token/refresh', {
    body: {
      deviceId: stored.deviceId,
      refreshToken: stored.refreshToken,
    },
    method: 'POST',
  });

  return response.data;
}

export async function logoutAuthSession(stored: StoredAuthSession | null): Promise<void> {
  if (!stored) {
    await clearStoredAuthSession();
    return;
  }

  try {
    await requestJson<ApiEnvelope<{ revokedSessions: number }>>('/auth/logout', {
      accessToken: stored.accessToken,
      body: { refreshToken: stored.refreshToken },
      method: 'POST',
    });
  } finally {
    await clearStoredAuthSession();
  }
}

export function isAuthSuccess(data: AuthChallenge | AuthSuccess): data is AuthSuccess {
  return 'tokens' in data && 'session' in data;
}

export async function persistAuthSuccess(data: AuthSuccess): Promise<StoredAuthSession> {
  const session: StoredAuthSession = {
    accessToken: data.tokens.accessToken,
    accessTokenExpiresAt: data.tokens.accessTokenExpiresAt,
    deviceId: data.session.deviceId,
    refreshToken: data.tokens.refreshToken,
    refreshTokenExpiresAt: data.tokens.refreshTokenExpiresAt,
    sessionId: data.session.id,
    tokenType: data.tokens.tokenType,
    userId: data.user.id,
  };

  await saveStoredAuthSession(session);
  await saveStoredDeviceId(data.session.deviceId);

  return session;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof IdentraAuthError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to complete authentication. Please try again.';
}

async function requestJson<T>(
  path: string,
  options: {
    accessToken?: string;
    body?: unknown;
    method: 'DELETE' | 'GET' | 'POST';
  },
): Promise<T> {
  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
  const url = `${getApiBaseUrl()}${path}`;

  logAuthRequest(url, options);

  try {
    response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      },
      method: options.method,
      signal: controller.signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new IdentraAuthError(
        `Identra Server did not respond within ${Math.round(AUTH_REQUEST_TIMEOUT_MS / 1000)} seconds. Please try again.`,
        'REQUEST_TIMEOUT',
      );
    }

    throw new IdentraAuthError(
      `Cannot reach Identra Server at ${getApiBaseUrl()}. Check that identra-server is running.`,
      'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timeout);
  }

  const body = await readJson<ApiErrorBody | T>(response);
  logAuthResponse(url, response.status, body);

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join('\n')
      : errorBody?.message || response.statusText || 'Authentication request failed.';

    throw new IdentraAuthError(message, errorBody?.code ?? errorBody?.error, response.status);
  }

  return body as T;
}

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function logAuthRequest(
  url: string,
  options: {
    accessToken?: string;
    body?: unknown;
    method: 'DELETE' | 'GET' | 'POST';
  },
) {
  if (!__DEV__) return;

  console.info('[Identra API request]', {
    body: redactSensitiveAuthData(options.body),
    method: options.method,
    url,
  });
}

function logAuthResponse(url: string, status: number, body: unknown) {
  if (!__DEV__) return;

  console.info('[Identra API response]', {
    body: redactSensitiveAuthData(body),
    status,
    url,
  });
}

function redactSensitiveAuthData(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.map(redactSensitiveAuthData);
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitiveAuthKey(key) ? '[REDACTED]' : redactSensitiveAuthData(entry),
    ]),
  );
}

function isSensitiveAuthKey(key: string): boolean {
  return /password|token|authorization/i.test(key);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_IDENTRA_API_URL?.trim();

  if (!__DEV__) {
    if (!configuredUrl) {
      throw new IdentraAuthError(
        'Production API URL is not configured. Set EXPO_PUBLIC_IDENTRA_API_URL before building the app.',
        'API_URL_NOT_CONFIGURED',
      );
    }

    return normalizeBaseUrl(ensureApiPrefix(validateProductionApiUrl(configuredUrl)));
  }

  const defaultUrl = getDefaultDevApiBaseUrl();

  return normalizeBaseUrl(ensureApiPrefix(resolveReachableDevApiUrl(configuredUrl || defaultUrl)));
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function ensureApiPrefix(rawUrl: string): string {
  const urlWithScheme = rawUrl.includes('://') ? rawUrl : `http://${rawUrl}`;

  try {
    const url = new URL(urlWithScheme);
    const pathname = normalizeBaseUrl(url.pathname);

    if (!pathname) {
      url.pathname = DEFAULT_API_PREFIX;
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

function validateProductionApiUrl(rawUrl: string): string {
  const urlWithScheme = rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`;

  try {
    const url = new URL(urlWithScheme);

    if (isLoopbackOrEmulatorHost(url.hostname)) {
      throw new IdentraAuthError(
        'Production API URL cannot point to localhost, 127.0.0.1, ::1, or 10.0.2.2.',
        'API_URL_NOT_PRODUCTION_SAFE',
      );
    }

    return url.toString();
  } catch (error) {
    if (error instanceof IdentraAuthError) {
      throw error;
    }

    throw new IdentraAuthError(
      'Production API URL is invalid. Set EXPO_PUBLIC_IDENTRA_API_URL to a full API origin or /v1 endpoint.',
      'API_URL_INVALID',
    );
  }
}

function resolveReachableDevApiUrl(rawUrl: string): string {
  if (Platform.OS !== 'android') {
    return rawUrl;
  }

  const expoHost = getExpoDevServerHost();

  if (!expoHost) {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl.includes('://') ? rawUrl : `http://${rawUrl}`);

    if (isLoopbackOrEmulatorHost(url.hostname)) {
      url.hostname = expoHost;
      return url.toString();
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

function getDefaultDevApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    const expoHost = getExpoDevServerHost();
    return expoHost ? `http://${expoHost}:4000/v1` : 'http://10.0.2.2:4000/v1';
  }

  return 'http://localhost:4000/v1';
}

function getExpoDevServerHost(): string | null {
  const constants = getExpoConstants();
  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.expoGoConfig?.debuggerHost ??
    constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];

  return host && !isLoopbackOrEmulatorHost(host) ? host : null;
}

function isLoopbackOrEmulatorHost(host: string): boolean {
  return ['10.0.2.2', '127.0.0.1', 'localhost', '::1'].includes(host.toLowerCase());
}

function createDeviceId(): string {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `identra-${Platform.OS}-${Date.now().toString(36)}-${randomPart}`;
}

function getAppVersion(): string | undefined {
  return getExpoConstants().expoConfig?.version;
}

function getDeviceName(): string {
  const constants = getExpoConstants();
  return constants.deviceName ?? `${Platform.OS} device`;
}

function getExpoConstants(): {
  deviceName?: string;
  expoGoConfig?: {
    debuggerHost?: string;
  };
  expoConfig?: {
    hostUri?: string;
    version?: string;
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
    };
  };
} {
  return Constants as {
    deviceName?: string;
    expoGoConfig?: {
      debuggerHost?: string;
    };
    expoConfig?: {
      hostUri?: string;
      version?: string;
    };
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };
}
