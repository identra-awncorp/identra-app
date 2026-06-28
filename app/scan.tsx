import { useRouter } from 'expo-router';

import { QrScannerScreen } from '@/screens/scan';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ScanRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, connectionInvitation, setChatReturnScreen, setConnectionInvitation } = useAppRouterState();

  return (
    <QrScannerScreen
      colors={colors}
      onOpenActivity={() => router.push('/activity')}
      onOpenChat={() => {
        setChatReturnScreen('scan');
        router.replace('/chat-list');
      }}
      onOpenMyQr={() => {
        const activeInvitation = connectionInvitation
          ? store.logs.find(
              (log) =>
                log.id === connectionInvitation.id &&
                log.status === 'pending' &&
                Boolean(log.expiresAt) &&
                new Date(log.expiresAt!).getTime() > Date.now(),
            )
          : null;
        if (activeInvitation) {
          router.push('/connection-qr');
          return;
        }

        const createdAt = Date.now();
        const id = `connection-invitation-${createdAt}`;
        store.addActivityLog({
          id,
          timestamp: new Date(createdAt).toISOString(),
          expiresAt: new Date(createdAt + 180000).toISOString(),
          type: 'share',
          status: 'pending',
          title: 'Lời mời kết nối',
          description: 'Đang chờ',
          partner: 'Kết nối SSI',
        });
        setConnectionInvitation({ id, createdAt });
        router.push('/connection-qr');
      }}
    />
  );
}
