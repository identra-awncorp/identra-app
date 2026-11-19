import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect } from 'react';

import { CredentialAccessGate, CredentialDetailScreen, useCredentialDetail } from '@/screens/identity';
import { useAppStore } from '@/store';
import { useAppRouterState } from '@/app/router/AppRouterContext';

export default function CredentialDetailRoute() {
  const { credentialId } = useLocalSearchParams<{ credentialId?: string | string[] }>();
  const requestedId = Array.isArray(credentialId) ? credentialId[0] : credentialId;
  const router = useRouter();
  const store = useAppStore();
  const { appActive, authenticateCredentialAccess, colors, credentialAccessRevision } = useAppRouterState();
  const backToList = useCallback(() => router.replace('/credentials'), [router]);
  if (!requestedId) return <Redirect href="/credentials" />;

  // The document is decrypted only inside the gate, after the person passed it.
  return (
    <CredentialAccessGate
      accessRevision={credentialAccessRevision}
      appActive={appActive}
      authenticate={authenticateCredentialAccess}
      colors={colors}
      enabled={store.settings.flowSettings.identity.requireAuthForCredential}
      onDenied={backToList}
    >
      <CredentialDetail id={requestedId} onBack={backToList} />
    </CredentialAccessGate>
  );
}

function CredentialDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const store = useAppStore();
  const { colors } = useAppRouterState();
  const { state, view, refresh, remove, retry } = useCredentialDetail(id);

  useEffect(() => {
    if (state.phase === 'removed') onBack();
  }, [onBack, state.phase]);

  return (
    <CredentialDetailScreen
      colors={colors}
      state={state}
      view={view}
      hideSensitive={store.settings.hideSensitiveData}
      shares={store.logs.filter((log) => log.type === 'share' && log.credentialId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp))}
      onBack={onBack}
      onRefresh={() => void refresh()}
      onRemove={() => void remove()}
      onRetry={retry}
      onOpenPortal={(url) => void Linking.openURL(url).catch(() => undefined)}
    />
  );
}
