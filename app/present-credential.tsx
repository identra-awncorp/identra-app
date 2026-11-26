import { Redirect, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { CredentialAccessGate, PresentCredentialScreen } from '@/screens/identity';
import { clearPendingPresentation, getPendingPresentation } from '@/domain/wallet/walletRuntime';
import { useAppStore } from '@/store';
import { useWalletSession } from '@/store/WalletSessionProvider';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PresentCredentialRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { appActive, authenticateCredentialAccess, colors, credentialAccessRevision, noteCredentialKeyAuthentication } = useAppRouterState();
  const { api } = useWalletSession();
  const [qrText] = useState(getPendingPresentation);
  // From "Chia sẻ" until the app goes to the background the gate stands aside: the signing key's
  // own biometric prompt (which makes iOS report `inactive`) must not unmount the screen mid-send.
  const [signing, setSigning] = useState(false);
  useEffect(() => () => clearPendingPresentation(), []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') setSigning(false);
    });
    return () => subscription.remove();
  }, []);
  const close = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/scan')), [router]);

  if (!qrText || !api) return <Redirect href="/scan" />;
  // Same protection as the detail screen: the documents are decrypted only after the gate passed.
  return (
    <CredentialAccessGate
      accessRevision={credentialAccessRevision}
      appActive={appActive}
      authenticate={authenticateCredentialAccess}
      colors={colors}
      enabled={store.settings.flowSettings.identity.requireAuthForCredential && !signing}
      onDenied={close}
    >
      <PresentCredentialScreen
        colors={colors}
        wallet={api}
        qrText={qrText}
        onClose={close}
        onScanAgain={() => router.replace('/scan')}
        onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
        onRecordActivity={store.addActivityLog}
        history={store.logs}
        shareLocks={store.shareLocks ?? []}
        historyKept={store.settings.flowSettings.identity.activityLogging}
        onSigningStarted={() => setSigning(true)}
        onSigned={noteCredentialKeyAuthentication}
      />
    </CredentialAccessGate>
  );
}
