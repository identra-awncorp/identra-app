const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  parseQrScanValue,
} = require('../.tmp-test/src/native/domain/scan/qrScan');

describe('qrScan', () => {
  const now = Date.parse('2026-07-23T00:00:00.000Z');

  it('accepts active Identra references without exposing embedded credential data', () => {
    assert.deepEqual(
      parseQrScanValue(
        'identra://credential-presentation?request=request-123&expires=2026-07-23T00%3A03%3A00.000Z',
        now,
      ),
      {
        kind: 'identra',
        purpose: 'credential-presentation',
        requestId: 'request-123',
        expiresAt: '2026-07-23T00:03:00.000Z',
      },
    );
  });

  it('rejects expired and malformed Identra references', () => {
    assert.deepEqual(
      parseQrScanValue(
        'identra://connection-invitation?request=request-456&expires=2026-07-23T00%3A00%3A00.000Z',
        now,
      ),
      { kind: 'expired-identra', purpose: 'connection-invitation' },
    );
    assert.deepEqual(
      parseQrScanValue('identra://credential-presentation?request=request-789', now),
      { kind: 'invalid-identra' },
    );
  });

  it('classifies secure, insecure, and plain-text values', () => {
    assert.deepEqual(parseQrScanValue('https://example.com/path', now), {
      kind: 'url',
      secure: true,
      url: 'https://example.com/path',
    });
    assert.deepEqual(parseQrScanValue('http://example.com', now), {
      kind: 'url',
      secure: false,
      url: 'http://example.com/',
    });
    assert.deepEqual(parseQrScanValue('hello', now), { kind: 'text', value: 'hello' });
  });
});
