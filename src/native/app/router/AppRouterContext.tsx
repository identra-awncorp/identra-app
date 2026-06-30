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
import { Animated, useColorScheme } from 'react-native';

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

interface AppRouterContextValue {
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
        } catch {
          await clearStoredAuthSession();
          return null;
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

  const logout = useCallback(async () => {
    const session = authSession ?? (await loadStoredAuthSession());

    await logoutAuthSession(session);
    setAuthSession(null);
    setAuthCompleted(false);
  }, [authSession]);

  const value = useMemo<AppRouterContextValue>(
    () => ({
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
      chatReturnScreen,
      colors,
      completeAuth,
      connectionInvitation,
      isDark,
      logout,
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
