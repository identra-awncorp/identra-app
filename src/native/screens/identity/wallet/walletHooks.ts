// Hooks that run the wallet flows for the routes: the reducers in domain/wallet/walletFlows.ts do
// the deciding, these only call the wallet and dispatch what came back.
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { CredentialsListState } from '../credentials/CredentialsScreen';
import { detailReducer, initialDetailState, initialRestoreState, restoreReducer, type DetailEvent } from '../../../domain/wallet/walletFlows';
import { failureCodeOfError } from '../../../domain/wallet/walletMessages';
import { credentialDetailView, credentialListItems } from '../../../domain/wallet/walletViews';
import { useI18n } from '../../../i18n';
import { useWalletSession } from '../../../store/WalletSessionProvider';

/** The list, reloaded each time the screen gains focus. */
export function useWalletList(): { state: CredentialsListState; reload: () => void } {
  const { locale } = useI18n();
  const { load, reload } = useWalletSession();
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );
  const state: CredentialsListState =
    load.phase === 'ready'
      ? {
          phase: 'ready',
          items: credentialListItems(load.credentials, locale),
          restoreNeeded: load.startup.kind === 'restored-device',
          toRequestCount: load.startup.toRequest.length,
        }
      : load.phase === 'failed'
        ? { phase: 'failed', failure: load.failure }
        : { phase: 'loading' };
  return { state, reload: () => void reload() };
}

export function useCredentialDetail(id: string) {
  const { locale } = useI18n();
  const { api, reload: reloadList } = useWalletSession();
  const [state, dispatch] = useReducer(detailReducer, initialDetailState);
  const live = useRef(true);
  const safeDispatch = (event: DetailEvent) => live.current && dispatch(event);

  const load = useCallback(async () => {
    if (!api) return dispatch({ type: 'failed', code: 'DEVICE_UNSUPPORTED' });
    try {
      const result = await api.credentials.get(id);
      if (live.current) dispatch({ type: 'loaded', result });
    } catch (error) {
      if (live.current) dispatch({ type: 'failed', code: failureCodeOfError(error) });
    }
  }, [api, id]);

  useEffect(() => {
    live.current = true;
    void load();
    return () => {
      live.current = false;
    };
  }, [load]);

  const refresh = async () => {
    if (!api || state.phase !== 'loaded' || state.refreshing) return;
    safeDispatch({ type: 'refresh' });
    const result = await api.credentials.refreshStatus(id).catch((error: unknown) => ({ ok: false as const, code: failureCodeOfError(error) }));
    safeDispatch({ type: 'refreshed', result, checkedAt: new Date().toISOString() });
    void reloadList();
  };

  const remove = async () => {
    if (!api || state.phase !== 'loaded') return;
    safeDispatch({ type: 'remove' });
    const result = await api.credentials.remove(id).catch((error: unknown) => ({ ok: false as const, code: failureCodeOfError(error) }));
    safeDispatch({ type: 'removed', result });
    void reloadList();
  };

  const view = state.phase === 'loaded' ? credentialDetailView(state.details, locale) : null;
  return { state, view, refresh, remove, retry: () => void load() };
}

export function useRestore() {
  const { api, reload: reloadList } = useWalletSession();
  const [state, dispatch] = useReducer(restoreReducer, initialRestoreState);

  const load = useCallback(async () => {
    if (!api) return dispatch({ type: 'load-failed', code: 'DEVICE_UNSUPPORTED' });
    try {
      dispatch({ type: 'loaded', startup: await api.getStartupState() });
    } catch (error) {
      dispatch({ type: 'load-failed', code: failureCodeOfError(error) });
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirm = async () => {
    if (!api) return;
    dispatch({ type: 'confirm' });
    try {
      await api.acknowledgeNewDevice();
      dispatch({ type: 'confirmed' });
    } catch (error) {
      dispatch({ type: 'confirm-failed', code: failureCodeOfError(error) });
    }
    void reloadList();
  };

  const forget = async (key: string) => {
    if (!api) return;
    const [vct, issuer] = JSON.parse(key) as [string, string];
    await api.forgetDocument({ vct, issuer }).catch(() => undefined);
    dispatch({ type: 'forgotten', key });
    void reloadList();
  };

  return { state, confirm, forget, retry: () => void load() };
}
