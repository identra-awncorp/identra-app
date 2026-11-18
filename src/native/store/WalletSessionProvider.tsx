// The wallet as the Identity screens see it: the API (null on an unsupported device), the start-up
// state and the held credentials. Loaded on first use, never at app start, so chat and payment
// never open the wallet database.
import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { useI18n } from '../i18n';
import type { WalletApi, WalletCredentialSummary, WalletStartupState } from '../domain/wallet/walletContainer';
import { failureCodeOfError, failureView, type FailureView } from '../domain/wallet/walletMessages';
import { getWalletApi, WalletUnavailableError } from '../domain/wallet/walletRuntime';

export type WalletLoad =
  | { phase: 'idle' | 'loading' }
  | { phase: 'failed'; failure: FailureView }
  /** `credentials` is empty on a restored device: those rows cannot be opened. */
  | { phase: 'ready'; startup: WalletStartupState; credentials: WalletCredentialSummary[] };

interface WalletSessionValue {
  /** null: this device failed the start-up self-check. */
  api: WalletApi | null;
  load: WalletLoad;
  /** Reloads start-up state and the list; keeps the old list on screen while loading. */
  reload: () => Promise<void>;
}

const WalletSessionContext = createContext<WalletSessionValue | null>(null);

export function WalletSessionProvider({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const prompt = t('wallet.biometricPrompt');
  const api = useMemo(() => {
    try {
      return getWalletApi({ authenticationPrompt: prompt });
    } catch (error) {
      if (error instanceof WalletUnavailableError) return null;
      throw error;
    }
  }, [prompt]);
  const [load, setLoad] = useState<WalletLoad>({ phase: 'idle' });
  const generation = useRef(0);

  const reload = useCallback(async () => {
    if (!api) {
      setLoad({ phase: 'failed', failure: failureView('DEVICE_UNSUPPORTED') });
      return;
    }
    const mine = ++generation.current;
    setLoad((current) => (current.phase === 'ready' ? current : { phase: 'loading' }));
    try {
      const startup = await api.getStartupState();
      const credentials = startup.kind === 'restored-device' ? [] : await api.credentials.list();
      if (mine === generation.current) setLoad({ phase: 'ready', startup, credentials });
    } catch (error) {
      if (mine === generation.current) setLoad({ phase: 'failed', failure: failureView(failureCodeOfError(error)) });
    }
  }, [api]);

  const value = useMemo(() => ({ api, load, reload }), [api, load, reload]);
  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
}

export function useWalletSession(): WalletSessionValue {
  const value = useContext(WalletSessionContext);
  if (!value) throw new Error('useWalletSession must be used inside WalletSessionProvider');
  return value;
}
