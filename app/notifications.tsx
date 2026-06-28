import { useRouter } from 'expo-router';

import { NotificationsScreen } from '@/screens/news-feed';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function NotificationsRoute() {
  const router = useRouter();
  const { colors, returnScreen, setReturnScreen } = useAppRouterState();

  return (
    <NotificationsScreen
      colors={colors}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
      onSettings={() => {
        setReturnScreen('notifications');
        router.push('/settings-notifications');
      }}
    />
  );
}
