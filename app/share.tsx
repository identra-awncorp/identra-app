import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { ShareScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useI18n } from '@/i18n';

export default function ShareRoute() {
  const router = useRouter();
  const { credentialId } = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const store = useAppStore();
  const { t } = useI18n();
  const { colors, setSharePayload } = useAppRouterState();
  const requestedCredentialId = Array.isArray(credentialId) ? credentialId[0] : credentialId;
  const credential = requestedCredentialId
    ? store.credentials.find((item) => item.id === requestedCredentialId)
    : store.credentials.find((item) => item.status === 'verified') ?? store.credentials[0];

  if (!credential) return <Redirect href="/credentials" />;

  return (
    <ShareScreen
      colors={colors}
      credential={credential}
      onBack={() =>
        requestedCredentialId
          ? router.replace({ pathname: '/credentials/[credentialId]', params: { credentialId: credential.id } })
          : router.replace('/wallet')
      }
      onShared={(items) => {
        store.addLog(
          t('activityLogs.shareDataTitle'),
          t('activityLogs.shareDataDescription', { count: items.length, credentialTitle: credential.title }),
          t('activityLogs.verifiedReceiver'),
          'share',
        );
        setSharePayload({ credential, attributes: items });
        router.push('/share-qr');
      }}
    />
  );
}
