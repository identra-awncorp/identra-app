import type { SeenStore } from '@identra/sdk-core';

export const SEEN_STORE_PREFIX = 'identra.wallet.seen.v1:';

export interface KeyValueStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/**
 * The SDK's optional SeenStore (last accepted `iat` / `signer_not_before` per trust list and
 * status list URL) on AsyncStorage. Values are integer seconds; anything else reads as absent,
 * which the SDK treats as "start blind".
 */
export function createAsyncStorageSeenStore(storage: KeyValueStorageLike): SeenStore {
  return {
    async get(key) {
      const raw = await storage.getItem(SEEN_STORE_PREFIX + key);
      if (raw === null || !/^[0-9]{1,16}$/.test(raw)) return null;
      const value = Number(raw);
      return Number.isSafeInteger(value) ? value : null;
    },
    async set(key, value) {
      if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('seen value must be a non-negative integer');
      await storage.setItem(SEEN_STORE_PREFIX + key, String(value));
    },
  };
}
