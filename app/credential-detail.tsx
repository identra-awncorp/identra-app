import { Redirect, useRouter } from 'expo-router';

import { CredentialDetailScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialDetailRoute() {
  const router = useRouter();
  const store = useAppStore();
  const { colors, selectedCredential } = useAppRouterState();

  if (!selectedCredential) return <Redirect href="/credentials" />;

  return (
    <CredentialDetailScreen
      colors={colors}
      credential={selectedCredential}
      hideSensitive={store.settings.hideSensitiveData}
      onBack={() => router.replace('/credentials')}
      onShare={() => router.push('/share')}
    />
  );
}
