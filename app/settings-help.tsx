import { useRouter } from 'expo-router';

import { HelpScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsHelpRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <HelpScreen colors={colors} onBack={() => router.replace('/settings')} />;
}
