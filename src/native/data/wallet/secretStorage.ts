import type { SecretStorage } from '@identra/sdk-app';
import type { SecureStoreOptions } from 'expo-secure-store';

/** The expo-secure-store functions these adapters call (injected so tests can fake them). */
export interface SecureStoreLike {
  getItemAsync(key: string, options?: SecureStoreOptions): Promise<string | null>;
  setItemAsync(key: string, value: string, options?: SecureStoreOptions): Promise<void>;
  deleteItemAsync(key: string, options?: SecureStoreOptions): Promise<void>;
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: number;
}

export type SecretStorageErrorCode =
  /** The user dismissed the biometric prompt. */
  | 'CANCELLED'
  /** iOS: the device is locked (errSecInteractionNotAllowed). */
  | 'LOCKED'
  /** The item existed but its biometric-bound key was invalidated (biometrics changed): request the credential again. */
  | 'KEY_INVALIDATED'
  /** Any other failure of the platform store. */
  | 'UNAVAILABLE'
  | 'VALUE_TOO_LARGE'
  | 'INVALID_NAME';

/** Code only: the native message names the key and keychain, so it is dropped. */
export class SecretStorageError extends Error {
  readonly code: SecretStorageErrorCode;
  constructor(code: SecretStorageErrorCode) {
    super(`secret storage failed: ${code}`);
    this.name = 'SecretStorageError';
    this.code = code;
  }
}

/** SecureStore's documented safe value size; SDK values are 43 base64url chars (32-byte wallet key or data key). */
export const MAX_SECRET_VALUE_BYTES = 2048;
const NAME = /^[A-Za-z0-9._-]{1,128}$/;

export const WALLET_KEYS_SERVICE = 'identra.wallet.keys';
export const WALLET_KEYS_INDEX_SERVICE = 'identra.wallet.keys.index';
export const VAULT_DATA_KEY_SERVICE = 'identra.wallet.vault';

/**
 * Maps a native SecureStore rejection to a code. Messages per node_modules/expo-secure-store:
 * Android AuthenticationPrompt "User canceled the authentication"; iOS KeyChainException
 * errSecUserCanceled "User canceled the operation." and errSecInteractionNotAllowed "User
 * interaction is not allowed."; Android EncryptException "... permanently invalidated ...".
 */
export function classifySecureStoreError(error: unknown): SecretStorageErrorCode {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  if (message.includes('permanently invalidated')) return 'KEY_INVALIDATED';
  if (message.includes('canceled') || message.includes('cancelled')) return 'CANCELLED';
  if (message.includes('interaction is not allowed')) return 'LOCKED';
  return 'UNAVAILABLE';
}

async function guarded<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw error instanceof SecretStorageError ? error : new SecretStorageError(classifySecureStoreError(error));
  }
}

function checkName(name: string): void {
  if (typeof name !== 'string' || !NAME.test(name)) throw new SecretStorageError('INVALID_NAME');
}

function checkValue(value: string): void {
  if (typeof value !== 'string' || new TextEncoder().encode(value).length > MAX_SECRET_VALUE_BYTES) {
    throw new SecretStorageError('VALUE_TOO_LARGE');
  }
}

/**
 * Wallet signing keys (ADR-0009 §1): biometrics on every read, this device only, own service.
 *
 * expo-secure-store resolves `null` both for "not found" and for a key invalidated by a
 * biometric change (Android catches KeyPermanentlyInvalidatedException and returns null; iOS
 * `biometryCurrentSet` items vanish, errSecItemNotFound). The SDK contract allows `null` only for
 * "not found", so every key also gets a presence marker in a non-biometric service: null with a
 * marker present is KEY_INVALIDATED. The marker holds "1", nothing secret.
 */
export function createWalletKeySecretStorage(store: SecureStoreLike, options: { authenticationPrompt: () => string }): SecretStorage {
  const secretOptions = (): SecureStoreOptions => ({
    keychainService: WALLET_KEYS_SERVICE,
    requireAuthentication: true,
    keychainAccessible: store.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationPrompt: options.authenticationPrompt(),
  });
  const indexOptions: SecureStoreOptions = {
    keychainService: WALLET_KEYS_INDEX_SERVICE,
    keychainAccessible: store.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  return {
    get: (name) =>
      guarded(async () => {
        checkName(name);
        const value = await store.getItemAsync(name, secretOptions());
        if (value !== null) return value;
        if ((await store.getItemAsync(name, indexOptions)) !== null) throw new SecretStorageError('KEY_INVALIDATED');
        return null;
      }),
    set: (name, value) =>
      guarded(async () => {
        checkName(name);
        checkValue(value);
        // Marker first: a marker without a secret only affects a key no row references.
        await store.setItemAsync(name, '1', indexOptions);
        try {
          await store.setItemAsync(name, value, secretOptions());
        } catch (error) {
          await store.deleteItemAsync(name, indexOptions).catch(() => undefined);
          throw error;
        }
      }),
    delete: (name) =>
      guarded(async () => {
        checkName(name);
        await store.deleteItemAsync(name, secretOptions());
        await store.deleteItemAsync(name, indexOptions);
      }),
  };
}

/**
 * The vault data key (ADR-0009 §3, sdk-app README): NO biometrics (a biometric change must not
 * make every credential unreadable), readable only while unlocked, this device only, own service.
 * Items without requireAuthentication cannot be invalidated, so `null` here means "not found"
 * (or wiped by the platform after a reinstall); the vault refuses to recreate the key while rows exist.
 */
export function createDataKeySecretStorage(store: SecureStoreLike): SecretStorage {
  const dataOptions: SecureStoreOptions = {
    keychainService: VAULT_DATA_KEY_SERVICE,
    keychainAccessible: store.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  return {
    get: (name) =>
      guarded(async () => {
        checkName(name);
        return store.getItemAsync(name, dataOptions);
      }),
    set: (name, value) =>
      guarded(async () => {
        checkName(name);
        checkValue(value);
        await store.setItemAsync(name, value, dataOptions);
      }),
    delete: (name) =>
      guarded(async () => {
        checkName(name);
        await store.deleteItemAsync(name, dataOptions);
      }),
  };
}
