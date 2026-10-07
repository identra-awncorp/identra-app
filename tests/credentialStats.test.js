const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  getCredentialStats,
} = require('../.tmp-test/src/native/domain/credentials/credentialStats');

describe('credentialStats', () => {
  it('derives status counts from the current credential collection', () => {
    const stats = getCredentialStats([
      { status: 'verified' },
      { status: 'verified' },
      { status: 'pending' },
      { status: 'expired' },
    ]);

    assert.deepEqual(stats, { verified: 2, pending: 1, expired: 1, total: 4 });
  });

  it('returns zero counts for an empty wallet', () => {
    assert.deepEqual(getCredentialStats([]), {
      verified: 0,
      pending: 0,
      expired: 0,
      total: 0,
    });
  });
});
