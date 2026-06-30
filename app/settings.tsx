import { useRouter } from 'expo-router';

import { SettingsScreen } from '@/screens/settings';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function SettingsRoute() {
  const router = useRouter();
  const { colors, logout, setChatReturnScreen, setReturnScreen } = useAppRouterState();

  return (
    <SettingsScreen
      colors={colors}
      onOpenAbout={() => router.push('/settings-about')}
      onOpenActivity={() => router.push('/activity')}
      onOpenBackup={() => router.push('/settings-backup')}
      onOpenChat={() => {
        setChatReturnScreen('settings');
        router.replace('/chat-list');
      }}
      onOpenData={() => router.push('/settings-data')}
      onOpenDisplay={() => router.push('/settings-display')}
      onOpenGovernance={() => router.push('/settings-governance')}
      onOpenHelp={() => router.push('/settings-help')}
      onOpenNotifications={() => {
        setReturnScreen('settings');
        router.push('/settings-notifications');
      }}
      onOpenSecurity={() => {
        setReturnScreen('settings');
        router.push('/security');
      }}
      onOpenSharing={() => router.push('/settings-sharing')}
      onLogout={async () => {
        await logout();
        router.replace('/login');
      }}
    />
  );
}
