import type { Credential } from '../../types';

export interface CredentialStats {
  expired: number;
  pending: number;
  total: number;
  verified: number;
}

export function getCredentialStats(credentials: Credential[]): CredentialStats {
  return credentials.reduce<CredentialStats>(
    (stats, credential) => ({
      ...stats,
      [credential.status]: stats[credential.status] + 1,
      total: stats.total + 1,
    }),
    { expired: 0, pending: 0, total: 0, verified: 0 },
  );
}
