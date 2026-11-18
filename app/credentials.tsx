import { useRouter } from 'expo-router';

import { CredentialsScreen, useWalletList } from '@/screens/identity';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialsRoute() {
  const router = useRouter();
  const { colors, returnScreen } = useAppRouterState();
  const { state, reload } = useWalletList();

  return (
    <CredentialsScreen
      colors={colors}
      state={state}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
      onOpenCredential={(credentialId) => router.push({ pathname: '/credentials/[credentialId]', params: { credentialId } })}
      onScan={() => router.push('/scan')}
      onOpenRestore={() => router.push('/wallet-restore')}
      onRetry={reload}
    />
  );
}
