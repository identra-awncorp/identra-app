import type { ActivityLog, AppSettings, Credential, PersonalInfo, ShareLock } from '../../types';
import { normalizeAppSettings } from './appSettingsDefaults';

export interface PersistedAppState {
  credentials: Credential[];
  logs: ActivityLog[];
  profile: PersonalInfo;
  settings: AppSettings;
  /** Delivered shares' locks kept while the sharing history is off (none in older stored data). */
  shareLocks?: ShareLock[];
}

export interface CreateActivityLogInput {
  title: string;
  description: string;
  partner: string;
  type?: ActivityLog['type'];
}

const FULL_NAME_ATTRIBUTE_KEY = 'subject.fullName';

function createActivityLogId(createdAt: Date): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `activity-${uuid}`;

  return `activity-${createdAt.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertCredentialInAppState(
  state: PersistedAppState,
  credential: Credential,
): PersistedAppState {
  return {
    ...state,
    credentials: [credential, ...state.credentials.filter((item) => item.id !== credential.id)],
  };
}

export function createActivityLog(
  input: CreateActivityLogInput,
  createdAt: Date = new Date(),
): ActivityLog {
  return {
    id: createActivityLogId(createdAt),
    timestamp: createdAt.toISOString(),
    title: input.title,
    description: input.description,
    partner: input.partner,
    type: input.type ?? 'add',
    unread: true,
    isNew: true,
  };
}

/** The lock part of a delivered share's entry ("sent, no result", with its deadline); null for anything else. */
function shareLockOf(log: ActivityLog): ShareLock | null {
  const { id, requestRef, credentialId, sharedClaims, sends, lockedUntil } = log;
  return log.type === 'share' && log.status === 'pending' && requestRef && credentialId && sharedClaims && sends && lockedUntil
    ? { id, requestRef, credentialId, sharedClaims, sends, lockedUntil }
    : null;
}

export function addActivityLogToAppState(
  state: PersistedAppState,
  log: ActivityLog,
): PersistedAppState {
  // A newer write for the same request replaces its lock (history on: the entry carries it from now on).
  const locks = state.shareLocks ?? [];
  const others = locks.filter((l) => l.id !== log.id && (!log.requestRef || l.requestRef !== log.requestRef));

  if (!state.settings.flowSettings.identity.activityLogging) {
    // History off: nothing is recorded, except what keeps a delivered request locked until its deadline.
    const lock = shareLockOf(log);
    if (!lock && others.length === locks.length) return state;
    return { ...state, shareLocks: lock ? [lock, ...others] : others };
  }

  return {
    ...state,
    logs: [{ ...log, unread: true, isNew: true }, ...state.logs.filter((item) => item.id !== log.id)],
    shareLocks: others,
  };
}

/** A share lock is a 600 s lock, not a record: it goes once its deadline has passed. */
export function dropExpiredShareLocksInAppState(state: PersistedAppState, nowMs: number): PersistedAppState {
  const locks = state.shareLocks ?? [];
  const kept = locks.filter((l) => Date.parse(l.lockedUntil) > nowMs);
  return kept.length === locks.length ? state : { ...state, shareLocks: kept };
}

export function updateActivityLogInAppState(
  state: PersistedAppState,
  id: string,
  updates: Partial<ActivityLog>,
): PersistedAppState {
  return {
    ...state,
    logs: state.logs.map((log) => (log.id === id ? { ...log, ...updates } : log)),
  };
}

/** A wallet document was removed: its sharing records (verifier and field names) go with it. */
export function removeCredentialActivityFromAppState(state: PersistedAppState, credentialId: string): PersistedAppState {
  return { ...state, logs: state.logs.filter((log) => log.credentialId !== credentialId) };
}

export function removeActivityLogFromAppState(
  state: PersistedAppState,
  id: string,
): PersistedAppState {
  return {
    ...state,
    logs: state.logs.filter((log) => log.id !== id),
  };
}

export function markAllActivityLogsReadInAppState(state: PersistedAppState): PersistedAppState {
  if (!state.logs.some((log) => log.unread)) return state;

  return {
    ...state,
    logs: state.logs.map((log) =>
      log.unread ? { ...log, unread: false, isNew: log.isNew === true } : log,
    ),
  };
}

export function clearNewActivityHighlightsInAppState(state: PersistedAppState): PersistedAppState {
  if (!state.logs.some((log) => log.isNew)) return state;

  return {
    ...state,
    logs: state.logs.map((log) => (log.isNew ? { ...log, isNew: false } : log)),
  };
}

export function expirePendingActivityLogsInAppState(
  state: PersistedAppState,
  nowMs: number,
  failedDescription: string,
): PersistedAppState {
  let changed = false;

  const logs = state.logs.map((log) => {
    const expiresAtMs = log.expiresAt ? new Date(log.expiresAt).getTime() : Number.NaN;

    if (log.status === 'pending' && Number.isFinite(expiresAtMs) && expiresAtMs <= nowMs) {
      changed = true;
      return {
        ...log,
        status: 'failed' as const,
        description: failedDescription,
        unread: true,
        isNew: true,
      };
    }

    return log;
  });

  return changed ? { ...state, logs } : state;
}

export function updateProfileInAppState(
  state: PersistedAppState,
  profile: PersonalInfo,
): PersistedAppState {
  return {
    ...state,
    profile,
    credentials: state.credentials.map((credential) => ({
      ...credential,
      attributes: credential.attributes.map((attribute) =>
        attribute.key === FULL_NAME_ATTRIBUTE_KEY
          ? { ...attribute, value: profile.fullName }
          : attribute,
      ),
    })),
  };
}

export function updateSettingsInAppState(
  state: PersistedAppState,
  settings: Partial<AppSettings>,
): PersistedAppState {
  const nextSettings = normalizeAppSettings({ ...state.settings, ...settings });

  if ('hideSensitiveData' in settings) {
    nextSettings.flowSettings.identity = {
      ...nextSettings.flowSettings.identity,
      hideSensitiveData: nextSettings.hideSensitiveData,
    };
  }

  return {
    ...state,
    settings: nextSettings,
  };
}

export function removeDemoDataFromAppState(state: PersistedAppState): PersistedAppState {
  return {
    ...state,
    credentials: state.credentials.filter((credential) => !credential.isDemo),
    logs: state.logs.filter((log) => !log.isDemo),
  };
}
