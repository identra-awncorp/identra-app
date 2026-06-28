import { useRouter } from 'expo-router';

import { CredentialsScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { getPathForScreen } from '@/app/navigation/navigationConfig';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialsRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, returnScreen, setSelectedCredential } = useAppRouterState();

  return (
    <CredentialsScreen
      colors={colors}
      credentials={store.credentials}
      onBack={() => router.replace(getPathForScreen(returnScreen))}
      onOpenCredential={(credential) => {
        setSelectedCredential(credential);
        router.push('/credential-detail');
      }}
      onScan={() => router.push('/scan')}
    />
  );
}
