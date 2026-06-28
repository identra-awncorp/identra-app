import { useRouter } from 'expo-router';

import { AboutScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsAboutRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <AboutScreen colors={colors} onBack={() => router.replace('/settings')} />;
}
