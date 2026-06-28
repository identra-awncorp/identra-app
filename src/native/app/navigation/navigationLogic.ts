import type { Href } from 'expo-router';

import type { ScreenKey, TabKey } from './navigationTypes';

export const initialScreen: ScreenKey = 'chat-list';

export const tabScreens: Record<TabKey, ScreenKey> = {
  chat: 'chat-list',
  feed: 'news-feed',
  scan: 'scan',
  payment: 'payment',
  identity: 'wallet',
};

export const bottomNavScreenKeys: ScreenKey[] = ['chat-list', 'news-feed', 'scan', 'payment', 'wallet', 'credentials'];

export const screenPaths: Record<ScreenKey, Href> = {
  wallet: '/wallet',
  'news-feed': '/news-feed',
  'news-feed-search': '/news-feed-search',
  'compose-post': '/compose-post',
  'live-stream': '/live-stream',
  payment: '/payment',
  credentials: '/credentials',
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
  return bottomNavScreenKeys.includes(screen);
}

export function shouldUseFloatingBottomNav(screen: ScreenKey): boolean {
  return screen === 'news-feed';
}

export function shouldCaptureReturnScreen(target: ScreenKey): boolean {
  return returnScreenTargets.has(target);
}
