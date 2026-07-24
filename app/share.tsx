import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { CredentialAccessGate, ShareScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useI18n } from '@/i18n';

export default function ShareRoute() {
  const router = useRouter();
  const { credentialId } = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const store = useAppStore();
  const { t } = useI18n();
  const {
    authenticateCredentialAccess,
    colors,
    lockCredentialAccess,
    setSharePayload,
  } = useAppRouterState();
  const requestedCredentialId = Array.isArray(credentialId) ? credentialId[0] : credentialId;
  const credential = requestedCredentialId
    ? store.credentials.find((item) => item.id === requestedCredentialId)
    : store.credentials.find((item) => item.status === 'verified') ?? store.credentials[0];
  const identitySettings = store.settings.flowSettings.identity;
  const goBack = useCallback(() => {
    if (requestedCredentialId) {
      router.replace({
        pathname: '/credentials/[credentialId]',
        params: { credentialId: requestedCredentialId },
      });
      return;
    }

    router.replace('/wallet');
  }, [requestedCredentialId, router]);
  const autoLock = useCallback(() => {
    setSharePayload(null);
    lockCredentialAccess();
    goBack();
  }, [goBack, lockCredentialAccess, setSharePayload]);

  if (!credential) return <Redirect href="/credentials" />;

  return (
    <CredentialAccessGate
      authenticate={authenticateCredentialAccess}
      colors={colors}
      enabled={identitySettings.requireAuthForCredential}
      onDenied={goBack}
    >
      <ShareScreen
        autoLockEnabled={identitySettings.autoLockSharing}
        colors={colors}
        confirmBeforeShare={identitySettings.askBeforeShareAttributes}
        credential={credential}
        onAutoLock={autoLock}
        onBack={goBack}
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
    </CredentialAccessGate>
  );
}
