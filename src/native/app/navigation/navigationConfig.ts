import type { ComponentType } from 'react';

import {
  ChatNavIcon,
  MiniAppNavIcon,
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

export const bottomNavScreens = new Set<ScreenKey>(bottomNavScreenKeys);

export const bottomNavItems: BottomNavScreenConfig[] = [
  { key: 'chat', labelKey: 'app.bottomNav.chat', icon: ChatNavIcon },
  { key: 'feed', labelKey: 'app.bottomNav.feed', icon: NewsFeedNavIcon },
  { key: 'scan', labelKey: 'app.bottomNav.scan', icon: ScanQrNavIcon },
  { key: 'payment', labelKey: 'app.bottomNav.payment', icon: PaymentNavIcon },
  { key: 'miniApp', labelKey: 'app.bottomNav.miniApp', icon: MiniAppNavIcon },
];
