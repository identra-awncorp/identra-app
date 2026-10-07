import { Redirect, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { CredentialAccessGate, ShareQrScreen } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';
import { useAppStore } from '@/store';

export default function ShareQrRoute() {
  const router = useRouter();
  const store = useAppStore();
  const {
    appActive,
    authenticateCredentialAccess,
    colors,
    credentialAccessRevision,
    lockCredentialAccess,
    setSharePayload,
    sharePayload,
  } = useAppRouterState();
  const closeAndLock = useCallback(() => {
    setSharePayload(null);
    lockCredentialAccess();
    router.replace('/activity');
  }, [lockCredentialAccess, router, setSharePayload]);

  if (!sharePayload) return <Redirect href="/wallet" />;

  return (
    <CredentialAccessGate
      accessRevision={credentialAccessRevision}
      appActive={appActive}
      authenticate={authenticateCredentialAccess}
      colors={colors}
      enabled={store.settings.flowSettings.identity.requireAuthForCredential}
      onDenied={closeAndLock}
    >
      <ShareQrScreen
        colors={colors}
        credential={sharePayload.credential}
        attributes={sharePayload.attributes}
        autoLockEnabled={store.settings.flowSettings.identity.autoLockSharing}
        compactDid={store.settings.flowSettings.identity.compactDid}
        onAutoLock={closeAndLock}
        onBack={() =>
          router.replace({ pathname: '/share', params: { credentialId: sharePayload.credential.id } })
        }
        onCancel={closeAndLock}
      />
    </CredentialAccessGate>
  );
}
