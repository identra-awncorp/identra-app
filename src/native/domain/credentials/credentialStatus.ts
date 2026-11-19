import type { CredentialStatus } from '../../types';

export type CredentialStatusTone = 'positive' | 'caution' | 'negative';

/** Exhaustive: a new CredentialStatus does not compile until it has a tone. */
export const credentialStatusTones: Record<CredentialStatus, CredentialStatusTone> = {
  verified: 'positive',
  pending: 'caution',
  suspended: 'caution',
  unknown: 'caution',
  expired: 'negative',
  revoked: 'negative',
  invalid: 'negative',
};
