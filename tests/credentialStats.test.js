const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  getCredentialStats,
} = require('../.tmp-test/src/native/domain/credentials/credentialStats');
const {
  credentialStatusTones,
} = require('../.tmp-test/src/native/domain/credentials/credentialStatus');

const ALL_STATUSES = ['verified', 'pending', 'expired', 'revoked', 'suspended', 'unknown'];

describe('credentialStats', () => {
  it('derives status counts from the current credential collection', () => {
    const stats = getCredentialStats([
      { status: 'verified' },
      { status: 'verified' },
      { status: 'pending' },
      { status: 'expired' },
      { status: 'revoked' },
      { status: 'suspended' },
      { status: 'unknown' },
      { status: 'unknown' },
    ]);

    assert.deepEqual(stats, { verified: 2, pending: 1, expired: 1, revoked: 1, suspended: 1, unknown: 2, total: 8 });
  });

  it('returns zero counts for an empty wallet', () => {
    assert.deepEqual(getCredentialStats([]), {
      verified: 0,
      pending: 0,
      expired: 0,
      revoked: 0,
      suspended: 0,
      unknown: 0,
      total: 0,
    });
  });

  it('gives every status a tone, and never a positive one to a credential that cannot be trusted', () => {
    assert.deepEqual(Object.keys(credentialStatusTones).sort(), [...ALL_STATUSES].sort());
    for (const status of ['pending', 'expired', 'revoked', 'suspended', 'unknown']) {
      assert.notEqual(credentialStatusTones[status], 'positive', status);
    }
    assert.equal(credentialStatusTones.revoked, 'negative');
  });
});
