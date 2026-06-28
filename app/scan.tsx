import { useRouter } from 'expo-router';

import { QrScannerScreen } from '@/screens/scan';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useI18n } from '@/i18n';

export default function ScanRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { t } = useI18n();
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
          title: t('activityLogs.connectionInvitationTitle'),
          description: t('activityLogs.pending'),
          partner: t('activityLogs.connectionInvitationPartner'),
        });
        setConnectionInvitation({ id, createdAt });
        router.push('/connection-qr');
      }}
    />
  );
}
