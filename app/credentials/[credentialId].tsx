import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { CredentialDetailScreen } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialDetailRoute() {
  const router = useRouter();
  const { credentialId } = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const store = useAppStore();
  const { colors } = useAppRouterState();
  const requestedCredentialId = Array.isArray(credentialId) ? credentialId[0] : credentialId;
  const credential = store.credentials.find((item) => item.id === requestedCredentialId);

  if (!credential) return <Redirect href="/credentials" />;

  return (
    <CredentialDetailScreen
      colors={colors}
      credential={credential}
      hideSensitive={store.settings.hideSensitiveData}
      onBack={() => router.replace('/credentials')}
      onShare={() => router.push({ pathname: '/share', params: { credentialId: credential.id } })}
    />
  );
}
