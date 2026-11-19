// What `identra-wallet-harness` resolves to in every normal build (metro.config.js): no harness.
// The scripted web-review wallet (src/native/dev/walletHarness.ts) is only resolved when
// EXPO_PUBLIC_WALLET_HARNESS=1, so it is never in a production module graph.
import type { WalletApi } from '../domain/wallet/walletContainer';

export interface WalletHarness {
  wallet(): WalletApi;
  pending(kind: 'offer' | 'presentation'): string | null;
  keyProtectionReady(): boolean;
}

export const harness: WalletHarness | null = null;
