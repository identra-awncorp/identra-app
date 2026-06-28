import { useRouter } from 'expo-router';

import { SecurityScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SecurityRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, returnScreen } = useAppRouterState();

  return (
    <SecurityScreen
      colors={colors}
      settings={store.settings}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
      onSettings={store.updateSettings}
    />
  );
}
