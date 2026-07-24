import { useRouter } from 'expo-router';

import { ActivityScreen } from '@/screens/settings';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ActivityRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, openSideMenu, setChatReturnScreen } = useAppRouterState();

  return (
    <ActivityScreen
      colors={colors}
      logs={store.logs}
      onOpenMenu={openSideMenu}
      onOpenChat={() => {
        setChatReturnScreen('activity');
        router.replace('/chat-list');
      }}
    />
  );
}
