import { Redirect, useRouter } from 'expo-router';

import { ConnectionQrScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ConnectionQrRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, connectionInvitation, setConnectionInvitation } = useAppRouterState();

  if (!connectionInvitation) return <Redirect href="/scan" />;

  return (
    <ConnectionQrScreen
      colors={colors}
      did={store.profile.did}
      createdAt={connectionInvitation.createdAt}
      onBack={() => router.replace('/scan')}
      onCancel={() => {
        store.removeActivityLog(connectionInvitation.id);
        setConnectionInvitation(null);
        router.replace('/scan');
      }}
      onRefresh={(createdAt) => {
        setConnectionInvitation((current) => (current ? { ...current, createdAt } : current));
        store.updateActivityLog(connectionInvitation.id, {
          timestamp: new Date(createdAt).toISOString(),
          expiresAt: new Date(createdAt + 180000).toISOString(),
          status: 'pending',
          description: 'Đang chờ',
        });
      }}
    />
  );
}
