// The one wallet instance of this app process: Expo modules wired into createWallet. Created
// lazily on first use, never at import time (importing this file only pulls the SDK into the bundle).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomValues } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { openDatabaseAsync } from 'expo-sqlite';

import { createCatalogueFile } from '../../data/wallet/catalogueFile';
import { createSqliteCredentialRepository, WALLET_DATABASE_NAME } from '../../data/wallet/credentialRepository';
import { createGatewayHttpFetch, createWalletHttpFetch, type PlatformFetch } from '../../data/wallet/httpFetch';
import { createExpoRandomSource } from '../../data/wallet/randomSource';
import { createDataKeySecretStorage, createWalletKeySecretStorage } from '../../data/wallet/secretStorage';
import { createAsyncStorageSeenStore } from '../../data/wallet/seenStore';
import { harness } from 'identra-wallet-harness';

import { getWalletRuntimeCheck } from '../../platform/installGlobals';
import type { RuntimeProblem } from '../../platform/runtimeGlobals';
import { credentialOfferQrText, presentationRequestQrText, type WalletQrRequest } from '../scan/qrScan';
import { CATALOGUE_FILE_NAME, certNetConfigOf, createWallet, type CertNetConfig, type Wallet, type WalletApi } from './walletContainer';

export class WalletUnavailableError extends Error {
  readonly problems: RuntimeProblem[];
  constructor(problems: RuntimeProblem[]) {
    super('this device cannot run the wallet');
    this.name = 'WalletUnavailableError';
    this.problems = problems;
  }
}

let instance: Wallet | null = null;
let authenticationPrompt = '';

/**
 * The DID trust path's gateway, from the build's public configuration (both variables or neither).
 * A wrong value stops a development build at once; a release build then runs with the DID path off
 * rather than lose the X.509 wallet over it (the variables are fixed at build time).
 */
function certNetConfig(): CertNetConfig | null {
  try {
    // Read literally: Expo inlines EXPO_PUBLIC_* only for `process.env.NAME` written out in full.
    return certNetConfigOf({ gatewayUrl: process.env.EXPO_PUBLIC_CERTNET_GATEWAY_URL, network: process.env.EXPO_PUBLIC_CERTNET_NETWORK }, { production: !__DEV__ });
  } catch (error) {
    if (__DEV__) throw error;
    return null;
  }
}

/**
 * The memoised wallet. `authenticationPrompt` (translated) is shown by the biometric prompt that
 * guards every wallet key read; the latest value is used. Throws WalletUnavailableError when the
 * start-up self-check failed.
 */
export function getWallet(options: { authenticationPrompt: string }): Wallet {
  authenticationPrompt = options.authenticationPrompt;
  const check = getWalletRuntimeCheck();
  if (!check.ok) throw new WalletUnavailableError(check.problems);
  const certNet = instance ? null : certNetConfig();
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
    // In the document directory, which the OS backup includes (iOS Documents; Android files/, see plugins/).
    catalogueFile: createCatalogueFile((name) => new File(Paths.document, name), CATALOGUE_FILE_NAME),
    plainStorage: AsyncStorage,
    certNet: certNet ? { ...certNet, fetch: createGatewayHttpFetch({ fetch: globalThis.fetch as unknown as PlatformFetch, gatewayUrl: certNet.gatewayUrl }) } : null,
  });
  return instance;
}

/**
 * What the screens call. A development web build made with EXPO_PUBLIC_WALLET_HARNESS=1 gets the
 * scripted review wallet; `identra-wallet-harness` resolves to an empty module in every other
 * build (metro.config.js), and the harness is refused outside __DEV__ as well.
 */
export function getWalletApi(options: { authenticationPrompt: string }): WalletApi {
  if (__DEV__ && harness) return harness.wallet();
  return getWallet(options);
}

/**
 * Whether this phone can keep a biometric-protected wallet key (asked BEFORE the one-time code is
 * spent): SecureStore's own check plus an enrolled screen lock / biometric, as the access gate asks.
 */
export async function isKeyProtectionReady(): Promise<boolean> {
  if (__DEV__ && harness) return harness.keyProtectionReady();
  try {
    if (!SecureStore.canUseBiometricAuthentication()) return false;
    return (await LocalAuthentication.getEnrolledLevelAsync()) !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** The scanned QR waiting for its screen (QR text never goes into a route or a log). */
const pending: Record<'offer' | 'presentation', string | null> = { offer: null, presentation: null };

export function getPendingOffer(): string | null {
  return pending.offer ?? (__DEV__ && harness ? harness.pending('offer') : null);
}

export function clearPendingOffer(): void {
  pending.offer = null;
}

export function getPendingPresentation(): string | null {
  return pending.presentation ?? (__DEV__ && harness ? harness.pending('presentation') : null);
}

export function clearPendingPresentation(): void {
  pending.presentation = null;
}

export type WalletHandOffResult =
  /** The device failed the start-up self-check. */
  | { kind: 'device-unsupported' }
  /** Open the receive screen; the offer waits in getPendingOffer(). */
  | { kind: 'receive' }
  /** Open the sharing (consent) screen; the request waits in getPendingPresentation(). */
  | { kind: 'present' };

/** The single entry from the QR scanner into the wallet. */
export async function handOffWalletRequest(request: WalletQrRequest): Promise<WalletHandOffResult> {
  if (!getWalletRuntimeCheck().ok) return { kind: 'device-unsupported' };
  if (request.kind === 'credential-offer') {
    pending.offer = credentialOfferQrText(request.offerUri);
    return { kind: 'receive' };
  }
  pending.presentation = presentationRequestQrText(request);
  return { kind: 'present' };
}
