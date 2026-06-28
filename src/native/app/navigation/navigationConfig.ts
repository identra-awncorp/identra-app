import type { ComponentType } from 'react';
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
import {
  bottomNavScreenKeys,
  getActiveTabForScreen,
  getPathForScreen,
  getScreenForPathname,
  getScreenForTab,
  initialScreen,
  screenPaths,
  shouldCaptureReturnScreen,
  shouldShowBottomNavForScreen,
  shouldUseFloatingBottomNav,
  tabScreens,
} from './navigationLogic';

export type { ScreenKey, TabKey };
export {
  getActiveTabForScreen,
  getPathForScreen,
  getScreenForPathname,
  getScreenForTab,
  initialScreen,
  screenPaths,
  shouldCaptureReturnScreen,
  shouldShowBottomNavForScreen,
  shouldUseFloatingBottomNav,
  tabScreens,
};

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

export const bottomNavScreens = new Set<ScreenKey>(bottomNavScreenKeys);

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
