import type {
  ActivityLog,
  AppSettings,
  Credential,
  CredentialAttribute,
  CredentialIconName,
  CredentialStatus,
  PersonalInfo,
  ShareLock,
} from '../../types';
import type { PersistedAppState } from './appStoreStateService';
import { normalizeAppSettings } from './appSettingsDefaults';

export const APP_STATE_STORAGE_VERSION = 2;

export interface PersistedSettingsEnvelope {
  settings: AppSettings;
  version: typeof APP_STATE_STORAGE_VERSION;
}

export interface PersistedIdentityEnvelope {
  credentials: Credential[];
  logs: ActivityLog[];
  profile: PersonalInfo;
  shareLocks: ShareLock[];
  version: typeof APP_STATE_STORAGE_VERSION;
}

// A Record so a new CredentialStatus fails to compile until it is accepted here.
const credentialStatusMembers: Record<CredentialStatus, true> = {
  verified: true,
  pending: true,
  expired: true,
  revoked: true,
  suspended: true,
  unknown: true,
  invalid: true,
};
const credentialStatuses = new Set(Object.keys(credentialStatusMembers) as CredentialStatus[]);
const credentialIcons = new Set<CredentialIconName>([
  'graduation',
  'languages',
  'shield',
  'bank',
  'clock',
  'security',
  'identity',
  'briefcase',
]);
const activityTypes = new Set<ActivityLog['type']>(['verify', 'share', 'add', 'security', 'scan']);
const activityStatuses = new Set<NonNullable<ActivityLog['status']>>(['success', 'pending', 'failed', 'uncertain']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function optionalString(value: unknown): string | undefined {
  return isString(value) ? value : undefined;
}

function inferLegacyAttributeKey(label: string, index: number): string {
  const normalized = label.trim().toLocaleLowerCase('vi');

  if (['họ và tên', 'full name', 'chủ tài khoản'].includes(normalized)) {
    return 'subject.fullName';
  }

  const slug = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  return `legacy.${slug || index}`;
}

function parseCredentialAttribute(value: unknown, index: number): CredentialAttribute | null {
  if (!isRecord(value) || !isString(value.label) || !isString(value.value)) {
    return null;
  }

  return {
    key: isString(value.key) && value.key.trim()
      ? value.key
      : inferLegacyAttributeKey(value.label, index),
    label: value.label,
    value: value.value,
    ...(typeof value.sensitive === 'boolean' ? { sensitive: value.sensitive } : {}),
  };
}

function parseCredential(value: unknown): Credential | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.title) ||
    !isString(value.issuer) ||
    !isString(value.issueDate) ||
    !credentialStatuses.has(value.status as CredentialStatus) ||
    !credentialIcons.has(value.icon as CredentialIconName) ||
    !isString(value.didIssuer) ||
    !isString(value.didHolder) ||
    !isString(value.signature) ||
    !Array.isArray(value.attributes)
  ) {
    return null;
  }

  const attributes = value.attributes
    .map(parseCredentialAttribute)
    .filter((attribute): attribute is CredentialAttribute => Boolean(attribute));

  if (attributes.length !== value.attributes.length) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    issuer: value.issuer,
    issueDate: value.issueDate,
    ...(optionalString(value.time) ? { time: value.time as string } : {}),
    ...(optionalString(value.expiryDate) ? { expiryDate: value.expiryDate as string } : {}),
    status: value.status as CredentialStatus,
    icon: value.icon as CredentialIconName,
    didIssuer: value.didIssuer,
    didHolder: value.didHolder,
    signature: value.signature,
    attributes,
    ...(typeof value.isDemo === 'boolean' ? { isDemo: value.isDemo } : {}),
  };
}

function parseActivityLog(value: unknown): ActivityLog | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.timestamp) ||
    !activityTypes.has(value.type as ActivityLog['type']) ||
    !isString(value.title) ||
    !isString(value.description) ||
    !isString(value.partner)
  ) {
    return null;
  }

  const status = activityStatuses.has(value.status as NonNullable<ActivityLog['status']>)
    ? value.status as ActivityLog['status']
    : undefined;

  return {
    id: value.id,
    timestamp: value.timestamp,
    ...(optionalString(value.expiresAt) ? { expiresAt: value.expiresAt as string } : {}),
    type: value.type as ActivityLog['type'],
    ...(status ? { status } : {}),
    title: value.title,
    description: value.description,
    partner: value.partner,
    ...(typeof value.unread === 'boolean' ? { unread: value.unread } : {}),
    ...(typeof value.isNew === 'boolean' ? { isNew: value.isNew } : {}),
    ...(typeof value.isDemo === 'boolean' ? { isDemo: value.isDemo } : {}),
    ...(optionalString(value.credentialId) ? { credentialId: value.credentialId as string } : {}),
    ...(Array.isArray(value.sharedClaims) && value.sharedClaims.every((n) => typeof n === 'string' && /^[a-z_]{1,40}$/.test(n))
      ? { sharedClaims: value.sharedClaims as string[] }
      : {}),
    ...(optionalString(value.requestRef) && (value.requestRef as string).length <= 4096 ? { requestRef: value.requestRef as string } : {}),
    ...(Number.isInteger(value.sends) && (value.sends as number) > 0 && (value.sends as number) < 100 ? { sends: value.sends as number } : {}),
    ...(optionalString(value.lockedUntil) ? { lockedUntil: value.lockedUntil as string } : {}),
  };
}

function parseShareLock(value: unknown): ShareLock | null {
  if (
    !isRecord(value) ||
    !isString(value.id) || value.id.length === 0 || value.id.length > 128 ||
    !isString(value.requestRef) || value.requestRef.length === 0 || value.requestRef.length > 4096 ||
    !isString(value.credentialId) || value.credentialId.length === 0 ||
    !Array.isArray(value.sharedClaims) || value.sharedClaims.length === 0 ||
    !value.sharedClaims.every((n) => typeof n === 'string' && /^[a-z_]{1,40}$/.test(n)) ||
    !Number.isInteger(value.sends) || (value.sends as number) < 1 || (value.sends as number) > 99 ||
    !isString(value.lockedUntil) || !Number.isFinite(Date.parse(value.lockedUntil))
  ) {
    return null;
  }

  // Only the lock's fields: anything else stored beside them is not loaded.
  return {
    id: value.id,
    requestRef: value.requestRef,
    credentialId: value.credentialId,
    sharedClaims: value.sharedClaims as string[],
    sends: value.sends as number,
    lockedUntil: value.lockedUntil,
  };
}

/** Absent (data stored before locks existed): none. Present: every one must be valid, like the logs. */
function parseShareLocks(value: unknown): ShareLock[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  const locks = value.map(parseShareLock);
  return locks.every((lock): lock is ShareLock => Boolean(lock)) ? locks : null;
}

function parseProfile(value: unknown): PersonalInfo | null {
  if (!isRecord(value)) return null;

  const keys: (keyof PersonalInfo)[] = [
    'fullName',
    'dob',
    'studentId',
    'school',
    'nationalId',
    'email',
    'phone',
    'address',
    'did',
  ];

  if (!keys.every((key) => isString(value[key]))) {
    return null;
  }

  return Object.fromEntries(keys.map((key) => [key, value[key]])) as unknown as PersonalInfo;
}

function parseCredentials(value: unknown): Credential[] | null {
  if (!Array.isArray(value)) return null;
  const credentials = value.map(parseCredential);
  return credentials.every((credential): credential is Credential => Boolean(credential))
    ? credentials
    : null;
}

function parseLogs(value: unknown): ActivityLog[] | null {
  if (!Array.isArray(value)) return null;
  const logs = value.map(parseActivityLog);
  return logs.every((log): log is ActivityLog => Boolean(log)) ? logs : null;
}

export function createPersistedSettingsEnvelope(settings: AppSettings): PersistedSettingsEnvelope {
  return {
    version: APP_STATE_STORAGE_VERSION,
    settings: normalizeAppSettings(settings),
  };
}

export function createPersistedIdentityEnvelope(state: PersistedAppState): PersistedIdentityEnvelope {
  return {
    version: APP_STATE_STORAGE_VERSION,
    credentials: state.credentials,
    logs: state.logs,
    profile: state.profile,
    shareLocks: state.shareLocks ?? [],
  };
}

export function parsePersistedSettingsEnvelope(value: unknown): AppSettings | null {
  if (
    !isRecord(value) ||
    value.version !== APP_STATE_STORAGE_VERSION ||
    !isRecord(value.settings)
  ) {
    return null;
  }

  return normalizeAppSettings(value.settings);
}

export function parsePersistedIdentityEnvelope(
  value: unknown,
): Omit<PersistedAppState, 'settings'> | null {
  if (!isRecord(value) || value.version !== APP_STATE_STORAGE_VERSION) {
    return null;
  }

  const credentials = parseCredentials(value.credentials);
  const logs = parseLogs(value.logs);
  const profile = parseProfile(value.profile);
  const shareLocks = parseShareLocks(value.shareLocks);

  if (!credentials || !logs || !profile || !shareLocks) {
    return null;
  }

  return { credentials, logs, profile, shareLocks };
}

export function migrateLegacyAppState(
  value: unknown,
  fallback: PersistedAppState,
): PersistedAppState | null {
  if (!isRecord(value)) {
    return null;
  }

  const credentials = parseCredentials(value.credentials);
  const logs = parseLogs(value.logs);
  const profile = parseProfile(value.profile);
  const hasRecognizedSection = Boolean(credentials || logs || profile || isRecord(value.settings));

  if (!hasRecognizedSection) {
    return null;
  }

  return {
    credentials: credentials ?? fallback.credentials,
    logs: logs ?? fallback.logs,
    profile: profile ?? fallback.profile,
    settings: normalizeAppSettings(isRecord(value.settings) ? value.settings : fallback.settings),
  };
}
