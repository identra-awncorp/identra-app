const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  shouldInvalidateStoredAuthSession,
  summarizeAuthPayload,
  isProductionApiUrlSecure,
} = require('../.tmp-test/src/native/domain/auth/authPolicy');

describe('authPolicy', () => {
  it('invalidates sessions only for definitive authentication failures', () => {
    assert.equal(shouldInvalidateStoredAuthSession({ status: 401 }), true);
    assert.equal(shouldInvalidateStoredAuthSession({ code: 'session_revoked' }), true);
    assert.equal(shouldInvalidateStoredAuthSession({ code: 'REFRESH_TOKEN_EXPIRED' }), true);
    assert.equal(shouldInvalidateStoredAuthSession({ status: 500 }), false);
    assert.equal(shouldInvalidateStoredAuthSession({ code: 'NETWORK_ERROR' }), false);
    assert.equal(shouldInvalidateStoredAuthSession(new Error('offline')), false);
  });

  it('summarizes payload shape without retaining values at any sensitivity level', () => {
    const summary = summarizeAuthPayload({
      challengeId: 'challenge-secret',
      demoOtp: '123456',
      device: { deviceId: 'device-secret' },
      phone: '0900000000',
    });

    assert.deepEqual(summary, {
      fields: ['challengeId', 'demoOtp', 'device', 'phone'],
      kind: 'object',
    });
    assert.doesNotMatch(JSON.stringify(summary), /123456|0900000000|challenge-secret|device-secret/);
  });

  it('accepts only HTTPS production API URLs', () => {
    assert.equal(isProductionApiUrlSecure('https://api.identra.example/v1'), true);
    assert.equal(isProductionApiUrlSecure('api.identra.example/v1'), true);
    assert.equal(isProductionApiUrlSecure('http://api.identra.example/v1'), false);
    assert.equal(isProductionApiUrlSecure('not a valid host'), false);
  });
});
