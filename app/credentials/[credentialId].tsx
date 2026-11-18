import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect } from 'react';

import { CredentialAccessGate, CredentialDetailScreen, useCredentialDetail } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialDetailRoute() {
  const { credentialId } = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const requestedId = Array.isArray(credentialId) ? credentialId[0] : credentialId;
  if (!requestedId) return <Redirect href="/credentials" />;
  return <CredentialDetail id={requestedId} />;
}

function CredentialDetail({ id }: { id: string }) {
  const router = useRouter();
  const store = useAppStore();
  const { appActive, authenticateCredentialAccess, colors, credentialAccessRevision } = useAppRouterState();
  const { state, view, refresh, remove, retry } = useCredentialDetail(id);
  const backToList = useCallback(() => router.replace('/credentials'), [router]);

  useEffect(() => {
    if (state.phase === 'removed') backToList();
  }, [backToList, state.phase]);

  return (
    <CredentialAccessGate
      accessRevision={credentialAccessRevision}
      appActive={appActive}
      authenticate={authenticateCredentialAccess}
      colors={colors}
      enabled={store.settings.flowSettings.identity.requireAuthForCredential}
      onDenied={backToList}
    >
      <CredentialDetailScreen
        colors={colors}
        state={state}
        view={view}
        hideSensitive={store.settings.hideSensitiveData}
        onBack={backToList}
        onRefresh={() => void refresh()}
        onRemove={() => void remove()}
        onRetry={retry}
        onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
      />
    </CredentialAccessGate>
  );
}
