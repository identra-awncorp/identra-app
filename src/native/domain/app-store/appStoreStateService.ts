import type { ActivityLog, AppSettings, Credential, PersonalInfo } from '../../types';
import { normalizeAppSettings } from './appSettingsDefaults';

export interface PersistedAppState {
  credentials: Credential[];
  logs: ActivityLog[];
  profile: PersonalInfo;
  settings: AppSettings;
}

export interface CreateActivityLogInput {
  title: string;
  description: string;
  partner: string;
  type?: ActivityLog['type'];
}

const FULL_NAME_ATTRIBUTE_KEY = 'subject.fullName';

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
    id: `activity-${createdAt.getTime()}`,
    timestamp: createdAt.toISOString(),
    title: input.title,
    description: input.description,
    partner: input.partner,
    type: input.type ?? 'add',
    unread: true,
    isNew: true,
  };
}

export function addActivityLogToAppState(
  state: PersistedAppState,
  log: ActivityLog,
): PersistedAppState {
  if (!state.settings.flowSettings.identity.activityLogging) {
    return state;
  }

  return {
    ...state,
    logs: [{ ...log, unread: true, isNew: true }, ...state.logs.filter((item) => item.id !== log.id)],
  };
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
