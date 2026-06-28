import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { Animated, useColorScheme } from 'react-native';

import { NEWS_FEED_OVERLAY_HEIGHT } from '../../screens/news-feed';
import { darkColors, lightColors, type AppColors } from '../../theme';
import type { Credential, ScreenKey, SmartContractFeedPost } from '../../types';
import { useAppStore } from '../../store';
import { initialScreen } from '../navigation/navigationConfig';

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
  chatReturnScreen: ScreenKey;
  colors: AppColors;
  completeAuth: () => void;
  connectionInvitation: ConnectionInvitation | null;
  closeSideMenu: () => void;
  isDark: boolean;
  newsFeedChromeProgress: Animated.AnimatedInterpolation<number>;
  newsFeedScrollY: Animated.Value;
  openSideMenu: () => void;
  returnScreen: ScreenKey;
  selectedChatId: string;
  selectedCredential: Credential | null;
  selectedSmartContractPost: SmartContractFeedPost | null;
  setChatReturnScreen: Dispatch<SetStateAction<ScreenKey>>;
  setConnectionInvitation: Dispatch<SetStateAction<ConnectionInvitation | null>>;
  setReturnScreen: Dispatch<SetStateAction<ScreenKey>>;
  setSelectedChatId: Dispatch<SetStateAction<string>>;
  setSelectedCredential: Dispatch<SetStateAction<Credential | null>>;
  setSelectedSmartContractPost: Dispatch<SetStateAction<SmartContractFeedPost | null>>;
  setSharePayload: Dispatch<SetStateAction<SharePayload | null>>;
  sharePayload: SharePayload | null;
  sideMenuOpen: boolean;
}

const AppRouterContext = createContext<AppRouterContextValue | null>(null);

export function AppRouterProvider({ children }: PropsWithChildren) {
  const store = useAppStore();
  const systemScheme = useColorScheme();
  const [authCompleted, setAuthCompleted] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [selectedSmartContractPost, setSelectedSmartContractPost] = useState<SmartContractFeedPost | null>(null);
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

  const value = useMemo<AppRouterContextValue>(
    () => ({
      authCompleted,
      chatReturnScreen,
      closeSideMenu: () => setSideMenuOpen(false),
      colors,
      completeAuth: () => setAuthCompleted(true),
      connectionInvitation,
      isDark,
      newsFeedChromeProgress,
      newsFeedScrollY,
      openSideMenu: () => setSideMenuOpen(true),
      returnScreen,
      selectedChatId,
      selectedCredential,
      selectedSmartContractPost,
      setChatReturnScreen,
      setConnectionInvitation,
      setReturnScreen,
      setSelectedChatId,
      setSelectedCredential,
      setSelectedSmartContractPost,
      setSharePayload,
      sharePayload,
      sideMenuOpen,
    }),
    [
      authCompleted,
      chatReturnScreen,
      colors,
      connectionInvitation,
      isDark,
      newsFeedChromeProgress,
      newsFeedScrollY,
      returnScreen,
      selectedChatId,
      selectedCredential,
      selectedSmartContractPost,
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
