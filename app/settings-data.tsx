import { useRouter } from 'expo-router';

import { DataSettingsScreen } from '@/screens/settings';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsDataRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors } = useAppRouterState();

  return (
    <DataSettingsScreen
      colors={colors}
      onBack={() => router.replace('/settings')}
      onClearDemo={store.clearDemoData}
      onResetDemo={store.resetDemoData}
    />
  );
}
