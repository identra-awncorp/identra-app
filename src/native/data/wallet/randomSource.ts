import type { RandomSource } from '@identra/sdk-core';

/** expo-crypto's limit for one native call. */
export const MAX_RANDOM_BYTES = 1024;

/**
 * RandomSource on expo-crypto. Built on `getRandomValues`, not `getRandomBytes`: in __DEV__
 * getRandomBytes falls back to Math.random when `global.nativeCallSyncHook` is absent
 * (node_modules/expo-crypto/build/Crypto.js), and that hook only exists in the legacy bridge's
 * JSIExecutor, not in RN 0.85's bridgeless runtime. getRandomValues always calls native.
 */
export function createExpoRandomSource(getRandomValues: (array: Uint8Array) => Uint8Array): RandomSource {
  return {
    bytes(n) {
      if (!Number.isInteger(n) || n < 1 || n > MAX_RANDOM_BYTES) throw new RangeError('random byte count out of range');
      const out = new Uint8Array(n);
      const filled = getRandomValues(out);
      if (!(filled instanceof Uint8Array) || filled.length !== n) throw new Error('random source returned the wrong length');
      return filled;
    },
  };
}
