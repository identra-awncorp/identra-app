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

export interface CredentialAccessPrompt {
  cancelLabel: string;
  fallbackLabel: string;
  promptMessage: string;
}

interface AppRouterContextValue {
  authenticateCredentialAccess: (prompt: CredentialAccessPrompt) => Promise<boolean>;
  authCompleted: boolean;
  authHydrated: boolean;
  authSession: StoredAuthSession | null;
  chatReturnScreen: ScreenKey;
  colors: AppColors;
  completeAuth: (session?: StoredAuthSession) => void;
  connectionInvitation: ConnectionInvitation | null;
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
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [authSession, setAuthSession] = useState<StoredAuthSession | null>(null);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [connectionInvitation, setConnectionInvitation] = useState<ConnectionInvitation | null>(null);
  const [returnScreen, setReturnScreen] = useState<ScreenKey>(initialScreen);
  const [chatReturnScreen, setChatReturnScreen] = useState<ScreenKey>(initialScreen);
  const [selectedChatId, setSelectedChatId] = useState('minh-anh');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const newsFeedScrollY = useRef(new Animated.Value(0)).current;
  const credentialAccessExpiresAt = useRef(0);
  const credentialAccessRequest = useRef<Promise<boolean> | null>(null);

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
    if (credentialAccessExpiresAt.current > Date.now()) {
      return true;
    }

    if (credentialAccessRequest.current) {
      return credentialAccessRequest.current;
    }

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

        if (result.success) {
          credentialAccessExpiresAt.current = Date.now() + 2 * 60 * 1000;
        }

        return result.success;
      } catch {
        return false;
      } finally {
        credentialAccessRequest.current = null;
      }
    })();

    credentialAccessRequest.current = request;
    return request;
  }, []);

  const lockCredentialAccess = useCallback(() => {
    credentialAccessExpiresAt.current = 0;
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
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
      authenticateCredentialAccess,
      authCompleted,
      authHydrated,
      authSession,
      chatReturnScreen,
      closeSideMenu: () => setSideMenuOpen(false),
      colors,
      completeAuth,
      connectionInvitation,
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
      authenticateCredentialAccess,
      chatReturnScreen,
      colors,
      completeAuth,
      connectionInvitation,
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
