import type { ComponentType } from 'react';
import type { Href } from 'expo-router';
import {
  BellRing,
  FileCheck2,
  House,
  NotebookPen,
  Settings,
  ShieldCheck,
  UserCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';

import {
  ChatNavIcon,
  IdentityNavIcon,
  NewsFeedNavIcon,
  PaymentNavIcon,
  ScanQrNavIcon,
  type BottomNavIconProps,
} from '../../components/icons/bottom-nav';
import type { I18nKey } from '../../i18n';
import type { ScreenKey, TabKey } from './navigationTypes';

export type { ScreenKey, TabKey };

export interface BottomNavScreenConfig {
  key: TabKey;
  labelKey: I18nKey;
  icon: ComponentType<BottomNavIconProps>;
}

export interface SideMenuItemConfig {
  target: ScreenKey;
  labelKey: I18nKey;
  descriptionKey: I18nKey;
  icon: LucideIcon;
  badgeKey?: 'unreadActivityCount';
}

export const initialScreen: ScreenKey = 'chat-list';

export const tabScreens: Record<TabKey, ScreenKey> = {
  chat: 'chat-list',
  feed: 'news-feed',
  scan: 'scan',
  payment: 'payment',
  identity: 'wallet',
};

export const bottomNavScreens = new Set<ScreenKey>(['chat-list', 'news-feed', 'scan', 'payment', 'wallet', 'credentials']);

export const screenPaths: Record<ScreenKey, Href> = {
  wallet: '/wallet',
  'news-feed': '/news-feed',
  'news-feed-search': '/news-feed-search',
  'compose-post': '/compose-post',
  'live-stream': '/live-stream',
  'smart-contract-detail': '/smart-contract-detail',
  payment: '/payment',
  credentials: '/credentials',
  'credential-detail': '/credential-detail',
  profile: '/profile',
  security: '/security',
  share: '/share',
  'share-qr': '/share-qr',
  'connection-qr': '/connection-qr',
  'chat-list': '/chat-list',
  chat: '/chat',
  notifications: '/notifications',
  scan: '/scan',
  activity: '/activity',
  settings: '/settings',
  'settings-backup': '/settings-backup',
  'settings-display': '/settings-display',
  'settings-governance': '/settings-governance',
  'settings-notifications': '/settings-notifications',
  'settings-sharing': '/settings-sharing',
  'settings-data': '/settings-data',
  'settings-help': '/settings-help',
  'settings-about': '/settings-about',
};

const screenByPath = new Map(Object.entries(screenPaths).map(([screen, path]) => [String(path), screen as ScreenKey]));

const activeTabByScreen: Partial<Record<ScreenKey, TabKey>> = {
  'chat-list': 'chat',
  'news-feed': 'feed',
  scan: 'scan',
  payment: 'payment',
  wallet: 'identity',
  credentials: 'identity',
};

const returnScreenTargets = new Set<ScreenKey>(['credentials', 'notifications', 'profile', 'security']);

export const bottomNavItems: BottomNavScreenConfig[] = [
  { key: 'chat', labelKey: 'app.bottomNav.chat', icon: ChatNavIcon },
  { key: 'feed', labelKey: 'app.bottomNav.feed', icon: NewsFeedNavIcon },
  { key: 'scan', labelKey: 'app.bottomNav.scan', icon: ScanQrNavIcon },
  { key: 'payment', labelKey: 'app.bottomNav.payment', icon: PaymentNavIcon },
  { key: 'identity', labelKey: 'app.bottomNav.identity', icon: IdentityNavIcon },
];

export const sideMenuItems: SideMenuItemConfig[] = [
  { target: 'news-feed', labelKey: 'app.sideMenu.feed.label', descriptionKey: 'app.sideMenu.feed.description', icon: House },
  { target: 'wallet', labelKey: 'app.sideMenu.identity.label', descriptionKey: 'app.sideMenu.identity.description', icon: UserRound },
  { target: 'credentials', labelKey: 'app.sideMenu.credentials.label', descriptionKey: 'app.sideMenu.credentials.description', icon: FileCheck2 },
  {
    target: 'activity',
    labelKey: 'app.sideMenu.activity.label',
    descriptionKey: 'app.sideMenu.activity.description',
    icon: NotebookPen,
    badgeKey: 'unreadActivityCount',
  },
  { target: 'settings', labelKey: 'app.sideMenu.settings.label', descriptionKey: 'app.sideMenu.settings.description', icon: Settings },
  { target: 'notifications', labelKey: 'app.sideMenu.notifications.label', descriptionKey: 'app.sideMenu.notifications.description', icon: BellRing },
  { target: 'profile', labelKey: 'app.sideMenu.profile.label', descriptionKey: 'app.sideMenu.profile.description', icon: UserCheck },
  { target: 'security', labelKey: 'app.sideMenu.security.label', descriptionKey: 'app.sideMenu.security.description', icon: ShieldCheck },
];

export function getScreenForTab(tab: TabKey): ScreenKey {
  return tabScreens[tab];
}

export function getPathForScreen(screen: ScreenKey): Href {
  return screenPaths[screen];
}

export function getScreenForPathname(pathname: string): ScreenKey | null {
  return screenByPath.get(pathname) ?? null;
}

export function getActiveTabForScreen(screen: ScreenKey): TabKey | null {
  return activeTabByScreen[screen] ?? null;
}

export function shouldShowBottomNavForScreen(screen: ScreenKey): boolean {
  return bottomNavScreens.has(screen);
}

export function shouldUseFloatingBottomNav(screen: ScreenKey): boolean {
  return screen === 'news-feed';
}

export function shouldCaptureReturnScreen(target: ScreenKey): boolean {
  return returnScreenTargets.has(target);
}
