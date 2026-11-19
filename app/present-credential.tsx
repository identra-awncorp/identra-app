import { Redirect, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

import { PresentCredentialScreen } from '@/screens/identity';
import { clearPendingPresentation, getPendingPresentation } from '@/domain/wallet/walletRuntime';
import { useAppStore } from '@/store';
import { useWalletSession } from '@/store/WalletSessionProvider';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function PresentCredentialRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors } = useAppRouterState();
  const { api } = useWalletSession();
  const [qrText] = useState(getPendingPresentation);
  useEffect(() => () => clearPendingPresentation(), []);

  if (!qrText || !api) return <Redirect href="/scan" />;
  return (
    <PresentCredentialScreen
      colors={colors}
      wallet={api}
      qrText={qrText}
      onClose={() => (router.canGoBack() ? router.back() : router.replace('/scan'))}
      onScanAgain={() => router.replace('/scan')}
      onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
      onRecordActivity={store.addActivityLog}
    />
  );
}
