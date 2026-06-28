import { useRouter } from 'expo-router';

import { CredentialsScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialsRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, returnScreen } = useAppRouterState();

  return (
    <CredentialsScreen
      colors={colors}
      credentials={store.credentials}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
      onOpenCredential={(credential) => {
        router.push({ pathname: '/credentials/[credentialId]', params: { credentialId: credential.id } });
      }}
      onScan={() => router.push('/scan')}
    />
  );
}
