import 'react-native-gesture-handler';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider, useAppStore } from '@/store';
import { AppRouterProvider } from '@/app/router/AppRouterContext';
import { AppShell } from '@/app/router/AppShell';
import { I18nProvider } from '@/i18n';
import { UnsupportedDeviceOverlay } from '@/screens/system/UnsupportedDeviceOverlay';
import { WalletSessionProvider } from '@/store/WalletSessionProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <LocalizedApp>
          <AppRouterProvider>
            <AppShell />
            <UnsupportedDeviceOverlay />
          </AppRouterProvider>
        </LocalizedApp>
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}

function LocalizedApp({ children }: PropsWithChildren) {
  const { settings } = useAppStore();

  return (
    <I18nProvider locale={settings.language}>
      <WalletSessionProvider>{children}</WalletSessionProvider>
    </I18nProvider>
  );
}
