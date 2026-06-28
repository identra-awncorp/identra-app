import { useRouter } from 'expo-router';

import { DisplaySettingsScreen } from '@/screens/settings';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsDisplayRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors } = useAppRouterState();

  return (
    <DisplaySettingsScreen
      colors={colors}
      settings={store.settings}
      onBack={() => router.replace('/settings')}
      onSettings={store.updateSettings}
    />
  );
}
