import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CREDENTIALS,
  INITIAL_PROFILE,
  INITIAL_SETTINGS,
} from './data/demo/identityDemoData';
import type { ActivityLog, AppSettings, Credential, PersonalInfo } from './types';

const STORAGE_KEY = 'identra.native.state.v1';

interface PersistedState {
  credentials: Credential[];
  logs: ActivityLog[];
  profile: PersonalInfo;
  settings: AppSettings;
}

interface AppStore extends PersistedState {
  hydrated: boolean;
  addCredential: (credential: Credential) => void;
  addLog: (title: string, description: string, partner: string, type?: ActivityLog['type']) => void;
  addActivityLog: (log: ActivityLog) => void;
  updateActivityLog: (id: string, updates: Partial<ActivityLog>) => void;
  removeActivityLog: (id: string) => void;
  markAllActivityLogsRead: () => void;
  clearNewActivityHighlights: () => void;
  updateProfile: (profile: PersonalInfo) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearDemoData: () => void;
  resetDemoData: () => void;
}

const initialState: PersistedState = {
  credentials: INITIAL_CREDENTIALS,
  logs: INITIAL_ACTIVITY_LOGS,
  profile: INITIAL_PROFILE,
  settings: INITIAL_SETTINGS,
};

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) setState(JSON.parse(saved) as PersistedState);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    const expireInvitations = () => {
      const now = Date.now();
      setState((current) => {
        let changed = false;
        const logs = current.logs.map((log) => {
          if (log.status === 'pending' && log.expiresAt && new Date(log.expiresAt).getTime() <= now) {
            changed = true;
            return { ...log, status: 'failed' as const, description: 'Thất bại', unread: true, isNew: true };
          }
          return log;
        });
        return changed ? { ...current, logs } : current;
      });
    };
    expireInvitations();
    const timer = setInterval(expireInvitations, 1000);
    return () => clearInterval(timer);
  }, [hydrated]);

  const addCredential = useCallback((credential: Credential) => {
    setState((current) => ({
      ...current,
      credentials: [credential, ...current.credentials.filter((item) => item.id !== credential.id)],
    }));
  }, []);

  const addLog = useCallback(
    (title: string, description: string, partner: string, type: ActivityLog['type'] = 'add') => {
      setState((current) => ({
        ...current,
        logs: [
          {
            id: `activity-${Date.now()}`,
            timestamp: new Date().toISOString(),
            title,
            description,
            partner,
            type,
            unread: true,
            isNew: true,
          },
          ...current.logs,
        ],
      }));
    },
    [],
  );

  const addActivityLog = useCallback((log: ActivityLog) => {
    setState((current) => ({
      ...current,
      logs: [{ ...log, unread: true, isNew: true }, ...current.logs.filter((item) => item.id !== log.id)],
    }));
  }, []);

  const updateActivityLog = useCallback((id: string, updates: Partial<ActivityLog>) => {
    setState((current) => ({
      ...current,
      logs: current.logs.map((log) => (log.id === id ? { ...log, ...updates } : log)),
    }));
  }, []);

  const removeActivityLog = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      logs: current.logs.filter((log) => log.id !== id),
    }));
  }, []);

  const markAllActivityLogsRead = useCallback(() => {
    setState((current) => {
      if (!current.logs.some((log) => log.unread)) return current;
      return {
        ...current,
        logs: current.logs.map((log) =>
          log.unread ? { ...log, unread: false, isNew: log.isNew === true } : log,
        ),
      };
    });
  }, []);

  const clearNewActivityHighlights = useCallback(() => {
    setState((current) => {
      if (!current.logs.some((log) => log.isNew)) return current;
      return {
        ...current,
        logs: current.logs.map((log) => (log.isNew ? { ...log, isNew: false } : log)),
      };
    });
  }, []);

  const updateProfile = useCallback((profile: PersonalInfo) => {
    setState((current) => ({
      ...current,
      profile,
      credentials: current.credentials.map((credential) => ({
        ...credential,
        attributes: credential.attributes.map((attribute) =>
          attribute.label === 'Họ và tên'
            ? { ...attribute, value: profile.fullName }
            : attribute,
        ),
      })),
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, ...settings },
    }));
  }, []);

  const clearDemoData = useCallback(() => {
    setState((current) => ({
      ...current,
      credentials: current.credentials.filter((credential) => !credential.isDemo),
      logs: current.logs.filter((log) => !log.isDemo),
    }));
  }, []);

  const resetDemoData = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      addCredential,
      addLog,
      addActivityLog,
      updateActivityLog,
      removeActivityLog,
      markAllActivityLogsRead,
      clearNewActivityHighlights,
      updateProfile,
      updateSettings,
      clearDemoData,
      resetDemoData,
    }),
    [
      state,
      hydrated,
      addCredential,
      addLog,
      addActivityLog,
      updateActivityLog,
      removeActivityLog,
      markAllActivityLogsRead,
      clearNewActivityHighlights,
      updateProfile,
      updateSettings,
      clearDemoData,
      resetDemoData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAppStore must be used inside AppStoreProvider');
  return store;
}
