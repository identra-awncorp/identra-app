import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

import { RestoreWalletScreen, useRestore } from '@/screens/identity';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function WalletRestoreRoute() {
  const router = useRouter();
  const { colors } = useAppRouterState();
  const { state, confirm, forget, retry } = useRestore();

  return (
    <RestoreWalletScreen
      colors={colors}
      state={state}
      onBack={() => (router.canGoBack() ? router.back() : router.replace('/credentials'))}
      onConfirm={() => void confirm()}
      onRetry={retry}
      onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
      onForget={(key) => void forget(key)}
    />
  );
}
