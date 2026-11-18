// Imported first by the app entry (index.ts). Fills the one global Expo 56 does not provide;
// see runtimeGlobals.ts for the full list and where each global comes from.
import { getRandomValues } from 'expo-crypto';

import { checkWalletRuntime, installRandomValues, type RandomValuesFn, type RuntimeCheckResult } from './runtimeGlobals';

installRandomValues(globalThis as unknown as Record<string, unknown>, getRandomValues as RandomValuesFn);

let cached: RuntimeCheckResult | null = null;

/** The start-up self-check, run once per process. */
export function getWalletRuntimeCheck(): RuntimeCheckResult {
  cached ??= checkWalletRuntime();
  return cached;
}
