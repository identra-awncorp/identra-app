// The one wallet instance of this app process: Expo modules wired into createWallet. Created
// lazily on first use, never at import time (importing this file only pulls the SDK into the bundle).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomValues } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { openDatabaseAsync } from 'expo-sqlite';

import { createSqliteCredentialRepository, WALLET_DATABASE_NAME } from '../../data/wallet/credentialRepository';
import { createWalletHttpFetch, type PlatformFetch } from '../../data/wallet/httpFetch';
import { createExpoRandomSource } from '../../data/wallet/randomSource';
import { createDataKeySecretStorage, createWalletKeySecretStorage } from '../../data/wallet/secretStorage';
import { createAsyncStorageSeenStore } from '../../data/wallet/seenStore';
import { getWalletRuntimeCheck } from '../../platform/installGlobals';
import type { RuntimeProblem } from '../../platform/runtimeGlobals';
import type { WalletQrRequest } from '../scan/qrScan';
import { CATALOGUE_FILE_NAME, createWallet, type CatalogueFile, type Wallet } from './walletContainer';

export class WalletUnavailableError extends Error {
  readonly problems: RuntimeProblem[];
  constructor(problems: RuntimeProblem[]) {
    super('this device cannot run the wallet');
    this.name = 'WalletUnavailableError';
    this.problems = problems;
  }
}

/** In the document directory, which the OS backup includes (iOS Documents; Android files/, see plugins/). */
function createCatalogueFile(): CatalogueFile {
  const file = new File(Paths.document, CATALOGUE_FILE_NAME);
  return {
    async read() {
      return file.exists ? file.text() : null;
    },
    async write(text) {
      if (!file.exists) file.create();
      file.write(text);
    },
  };
}

let instance: Wallet | null = null;
let authenticationPrompt = '';

/**
 * The memoised wallet. `authenticationPrompt` (translated) is shown by the biometric prompt that
 * guards every wallet key read; the latest value is used. Throws WalletUnavailableError when the
 * start-up self-check failed.
 */
export function getWallet(options: { authenticationPrompt: string }): Wallet {
  authenticationPrompt = options.authenticationPrompt;
  const check = getWalletRuntimeCheck();
  if (!check.ok) throw new WalletUnavailableError(check.problems);
  instance ??= createWallet({
    random: createExpoRandomSource(getRandomValues),
    clock: { now: () => new Date() },
    fetch: createWalletHttpFetch({
      fetch: globalThis.fetch as unknown as PlatformFetch,
      apiUrl: process.env.EXPO_PUBLIC_IDENTRA_API_URL,
      production: !__DEV__,
    }),
    seen: createAsyncStorageSeenStore(AsyncStorage),
    keySecrets: createWalletKeySecretStorage(SecureStore, { authenticationPrompt: () => authenticationPrompt }),
    dataKeySecrets: createDataKeySecretStorage(SecureStore),
    repository: createSqliteCredentialRepository(() => openDatabaseAsync(WALLET_DATABASE_NAME)),
    catalogueFile: createCatalogueFile(),
  });
  return instance;
}

export type WalletHandOffResult =
  /** The device failed the start-up self-check. */
  | { kind: 'device-unsupported' }
  /** This build has no issuance or presentation flow; nothing was fetched or stored. */
  | { kind: 'flow-unavailable'; request: WalletQrRequest['kind'] };

/**
 * The single entry from the QR scanner into the wallet. The issuance and presentation flows plug
 * in here; until then the honest answer is that this build cannot open such codes, and nothing
 * is fetched, stored or sent.
 */
export async function handOffWalletRequest(request: WalletQrRequest): Promise<WalletHandOffResult> {
  if (!getWalletRuntimeCheck().ok) return { kind: 'device-unsupported' };
  return { kind: 'flow-unavailable', request: request.kind };
}
