import { Redirect, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

import { ReceiveCredentialScreen } from '@/screens/identity';
import { clearPendingOffer, getPendingOffer } from '@/domain/wallet/walletRuntime';
import { useWalletSession } from '@/store/WalletSessionProvider';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function ReceiveCredentialRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();
  const { api } = useWalletSession();
  const [qrText] = useState(getPendingOffer);
  useEffect(() => () => clearPendingOffer(), []);

  if (!qrText || !api) return <Redirect href="/scan" />;
  return (
    <ReceiveCredentialScreen
      colors={colors}
      wallet={api}
      qrText={qrText}
      onClose={() => router.replace('/credentials')}
      onScanAgain={() => router.replace('/scan')}
      onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
      onOpenCredential={(credentialId) => router.replace({ pathname: '/credentials/[credentialId]', params: { credentialId } })}
    />
  );
}
