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
  addActivityLogToAppState,
  clearNewActivityHighlightsInAppState,
  createActivityLog,
  expirePendingActivityLogsInAppState,
  markAllActivityLogsReadInAppState,
  removeActivityLogFromAppState,
  removeDemoDataFromAppState,
  updateActivityLogInAppState,
  updateProfileInAppState,
  updateSettingsInAppState,
  upsertCredentialInAppState,
  type PersistedAppState,
} from '../domain/app-store/appStoreStateService';
import { translate } from '../i18n';
import type { ActivityLog, AppSettings, Credential, PersonalInfo } from '../types';
import { initialAppStoreState } from './appStoreInitialState';
import { loadPersistedAppState, savePersistedAppState } from './appStoreStorage';

export interface AppStore extends PersistedAppState {
  hydrated: boolean;
  storageError: 'load' | 'save' | null;
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
  retryStorage: () => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PersistedAppState>(initialAppStoreState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<'load' | 'save' | null>(null);
  const [hydrationAttempt, setHydrationAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    setStorageError(null);
    loadPersistedAppState()
      .then((saved) => {
        if (!mounted) return;
        if (saved) setState(saved);
        setHydrated(true);
      })
      .catch(() => {
        if (!mounted) return;
        setHydrated(false);
        setStorageError('load');
      });

    return () => {
      mounted = false;
    };
  }, [hydrationAttempt]);

  useEffect(() => {
    if (!hydrated) return;

    let current = true;
    void savePersistedAppState(state).then(
      () => {
        if (current) setStorageError((error) => error === 'save' ? null : error);
      },
      () => {
        if (current) setStorageError('save');
      },
    );

    return () => {
      current = false;
    };
  }, [hydrated, saveAttempt, state]);

  useEffect(() => {
    if (!hydrated) return;

    const expireInvitations = () => {
      const now = Date.now();

      setState((current) =>
        expirePendingActivityLogsInAppState(
          current,
          now,
          translate(current.settings.language, 'activityLogs.failed'),
        ),
      );
    };

    expireInvitations();
    const timer = setInterval(expireInvitations, 1000);
    return () => clearInterval(timer);
  }, [hydrated]);

  const addCredential = useCallback((credential: Credential) => {
    setState((current) => upsertCredentialInAppState(current, credential));
  }, []);

  const addLog = useCallback(
    (title: string, description: string, partner: string, type: ActivityLog['type'] = 'add') => {
      setState((current) =>
        addActivityLogToAppState(current, createActivityLog({ title, description, partner, type })),
      );
    },
    [],
  );

  const addActivityLog = useCallback((log: ActivityLog) => {
    setState((current) => addActivityLogToAppState(current, log));
  }, []);

  const updateActivityLog = useCallback((id: string, updates: Partial<ActivityLog>) => {
    setState((current) => updateActivityLogInAppState(current, id, updates));
  }, []);

  const removeActivityLog = useCallback((id: string) => {
    setState((current) => removeActivityLogFromAppState(current, id));
  }, []);

  const markAllActivityLogsRead = useCallback(() => {
    setState((current) => markAllActivityLogsReadInAppState(current));
  }, []);

  const clearNewActivityHighlights = useCallback(() => {
    setState((current) => clearNewActivityHighlightsInAppState(current));
  }, []);

  const updateProfile = useCallback((profile: PersonalInfo) => {
    setState((current) => updateProfileInAppState(current, profile));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((current) => updateSettingsInAppState(current, settings));
  }, []);

  const clearDemoData = useCallback(() => {
    setState((current) => removeDemoDataFromAppState(current));
  }, []);

  const resetDemoData = useCallback(() => setState(initialAppStoreState), []);
  const retryStorage = useCallback(() => {
    if (storageError === 'load') {
      setHydrationAttempt((attempt) => attempt + 1);
      return;
    }

    setSaveAttempt((attempt) => attempt + 1);
  }, [storageError]);

  const value = useMemo(
    () => ({
      ...state,
      hydrated,
      storageError,
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
      retryStorage,
    }),
    [
      state,
      hydrated,
      storageError,
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
      retryStorage,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useAppStore must be used inside AppStoreProvider');
  return store;
}
