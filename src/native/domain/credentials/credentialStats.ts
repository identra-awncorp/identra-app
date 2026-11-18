import type { Credential, CredentialStatus } from '../../types';

export type CredentialStats = Record<CredentialStatus, number> & { total: number };

export function getCredentialStats(credentials: Credential[]): CredentialStats {
  const stats: CredentialStats = { verified: 0, pending: 0, expired: 0, revoked: 0, suspended: 0, unknown: 0, total: 0 };
  for (const credential of credentials) {
    stats[credential.status] += 1;
    stats.total += 1;
  }
  return stats;
}
