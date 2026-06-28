import { useRouter } from 'expo-router';

import { BackupSettingsScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsBackupRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();

  return <BackupSettingsScreen colors={colors} onBack={() => router.replace('/settings')} />;
}
