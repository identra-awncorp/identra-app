import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { Animated, AppState, useColorScheme } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { NEWS_FEED_OVERLAY_HEIGHT } from '../../screens/news-feed';
import { darkColors, lightColors, type AppColors } from '../../theme';
import type { Credential, ScreenKey } from '../../types';
import { useAppStore } from '../../store';
import { initialScreen } from '../navigation/navigationConfig';
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  logoutAuthSession,
  persistAuthSuccess,
  refreshAuthSession,
  shouldInvalidateStoredAuthSession,
  type StoredAuthSession,
} from '../../domain/auth';

interface SharePayload {
  credential: Credential;
  attributes: Credential['attributes'];
}

interface ConnectionInvitation {
  id: string;
  createdAt: number;
}

interface CredentialAccessRequest {
  generation: number;
  promise: Promise<boolean>;
}

export interface CredentialAccessPrompt {
  cancelLabel: string;
  fallbackLabel: string;
  promptMessage: string;
}

interface AppRouterContextValue {
  appActive: boolean;
  authenticateCredentialAccess: (prompt: CredentialAccessPrompt) => Promise<boolean>;
  authCompleted: boolean;
  authHydrated: boolean;
  authSession: StoredAuthSession | null;
  chatReturnScreen: ScreenKey;
  colors: AppColors;
  completeAuth: (session?: StoredAuthSession) => void;
  connectionInvitation: ConnectionInvitation | null;
  credentialAccessRevision: number;
  closeSideMenu: () => void;
  isDark: boolean;
  logout: () => Promise<void>;
  lockCredentialAccess: () => void;
  newsFeedChromeProgress: Animated.AnimatedInterpolation<number>;
  newsFeedScrollY: Animated.Value;
  openSideMenu: () => void;
  returnScreen: ScreenKey;
  selectedChatId: string;
  setChatReturnScreen: Dispatch<SetStateAction<ScreenKey>>;
  setConnectionInvitation: Dispatch<SetStateAction<ConnectionInvitation | null>>;
  setReturnScreen: Dispatch<SetStateAction<ScreenKey>>;
  setSelectedChatId: Dispatch<SetStateAction<string>>;
  setSharePayload: Dispatch<SetStateAction<SharePayload | null>>;
  sharePayload: SharePayload | null;
  sideMenuOpen: boolean;
}

const AppRouterContext = createContext<AppRouterContextValue | null>(null);

export function AppRouterProvider({ children }: PropsWithChildren) {
  const store = useAppStore();
  const systemScheme = useColorScheme();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [authSession, setAuthSession] = useState<StoredAuthSession | null>(null);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [connectionInvitation, setConnectionInvitation] = useState<ConnectionInvitation | null>(null);
  const [returnScreen, setReturnScreen] = useState<ScreenKey>(initialScreen);
  const [chatReturnScreen, setChatReturnScreen] = useState<ScreenKey>(initialScreen);
  const [selectedChatId, setSelectedChatId] = useState('minh-anh');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [credentialAccessRevision, setCredentialAccessRevision] = useState(0);
  const newsFeedScrollY = useRef(new Animated.Value(0)).current;
  const credentialAccessGeneration = useRef(0);
  const credentialAccessExpiresAt = useRef(0);
  const credentialAccessRequest = useRef<CredentialAccessRequest | null>(null);

  const isDark = store.settings.theme === 'dark' || (store.settings.theme === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;
  const newsFeedChromeProgress = useMemo(
    () =>
      Animated.diffClamp(newsFeedScrollY, 0, NEWS_FEED_OVERLAY_HEIGHT).interpolate({
        inputRange: [0, NEWS_FEED_OVERLAY_HEIGHT],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [newsFeedScrollY],
  );

  useEffect(() => {
    let mounted = true;

    loadStoredAuthSession()
      .then(async (saved) => {
        if (!saved) return null;

        try {
          const refreshed = await refreshAuthSession(saved);
          return persistAuthSuccess(refreshed);
        } catch (error) {
          if (shouldInvalidateStoredAuthSession(error)) {
            await clearStoredAuthSession();
            return null;
          }

          return saved;
        }
      })
      .then((session) => {
        if (!mounted) return;
        setAuthSession(session);
        setAuthCompleted(Boolean(session));
      })
      .finally(() => {
        if (mounted) setAuthHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const completeAuth = useCallback((session?: StoredAuthSession) => {
    if (session) setAuthSession(session);
    setAuthCompleted(true);
  }, []);

  const authenticateCredentialAccess = useCallback(async (prompt: CredentialAccessPrompt) => {
    if (AppState.currentState !== 'active') {
      return false;
    }

    const generation = credentialAccessGeneration.current;
    if (credentialAccessExpiresAt.current > Date.now()) {
      return true;
    }

    const pendingRequest = credentialAccessRequest.current;
    if (pendingRequest?.generation === generation) {
      return pendingRequest.promise;
    }

    if (pendingRequest) {
      await pendingRequest.promise.catch(() => false);
      if (
        AppState.currentState !== 'active' ||
        credentialAccessGeneration.current !== generation
      ) {
        return false;
      }

      const newerRequest = credentialAccessRequest.current;
      if (newerRequest) return newerRequest.promise;
    }

    const requestRecord: CredentialAccessRequest = {
      generation,
      promise: Promise.resolve(false),
    };
    const request = (async () => {
      try {
        const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();
        if (securityLevel === LocalAuthentication.SecurityLevel.NONE) {
          return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
          cancelLabel: prompt.cancelLabel,
          disableDeviceFallback: false,
          fallbackLabel: prompt.fallbackLabel,
          promptMessage: prompt.promptMessage,
        });

        const accessStillValid =
          result.success &&
          AppState.currentState === 'active' &&
          credentialAccessGeneration.current === generation;

        if (accessStillValid) {
          credentialAccessExpiresAt.current = Date.now() + 2 * 60 * 1000;
        }

        return accessStillValid;
      } catch {
        return false;
      } finally {
        if (credentialAccessRequest.current === requestRecord) {
          credentialAccessRequest.current = null;
        }
      }
    })();

    requestRecord.promise = request;
    credentialAccessRequest.current = requestRecord;
    return request;
  }, []);

  const lockCredentialAccess = useCallback(() => {
    credentialAccessGeneration.current += 1;
    credentialAccessExpiresAt.current = 0;
    void LocalAuthentication.cancelAuthenticate().catch(() => undefined);
    setCredentialAccessRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const active = nextState === 'active';
      setAppActive(active);
      if (!active) {
        lockCredentialAccess();
      }
    });

    return () => subscription.remove();
  }, [lockCredentialAccess]);

  const logout = useCallback(async () => {
    const session = authSession ?? (await loadStoredAuthSession());

    try {
      await logoutAuthSession(session);
    } finally {
      lockCredentialAccess();
      setAuthSession(null);
      setAuthCompleted(false);
    }
  }, [authSession, lockCredentialAccess]);

  const value = useMemo<AppRouterContextValue>(
    () => ({
      appActive,
      authenticateCredentialAccess,
      authCompleted,
      authHydrated,
      authSession,
      chatReturnScreen,
      closeSideMenu: () => setSideMenuOpen(false),
      colors,
      completeAuth,
      connectionInvitation,
      credentialAccessRevision,
      isDark,
      logout,
      lockCredentialAccess,
      newsFeedChromeProgress,
      newsFeedScrollY,
      openSideMenu: () => setSideMenuOpen(true),
      returnScreen,
      selectedChatId,
      setChatReturnScreen,
      setConnectionInvitation,
      setReturnScreen,
      setSelectedChatId,
      setSharePayload,
      sharePayload,
      sideMenuOpen,
    }),
    [
      authCompleted,
      authHydrated,
      authSession,
      appActive,
      authenticateCredentialAccess,
      chatReturnScreen,
      colors,
      completeAuth,
      connectionInvitation,
      credentialAccessRevision,
      isDark,
      logout,
      lockCredentialAccess,
      newsFeedChromeProgress,
      newsFeedScrollY,
      returnScreen,
      selectedChatId,
      sharePayload,
      sideMenuOpen,
    ],
  );

  return <AppRouterContext.Provider value={value}>{children}</AppRouterContext.Provider>;
}

export function useAppRouterState() {
  const value = useContext(AppRouterContext);
  if (!value) throw new Error('useAppRouterState must be used inside AppRouterProvider');
  return value;
}
