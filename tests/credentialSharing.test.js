const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  createTemporaryQrReference,
  getTemporaryQrRemainingSeconds,
  isTemporaryQrReferenceExpired,
  selectApprovedCredentialAttributes,
  serializeTemporaryQrReference,
  TEMPORARY_QR_TTL_MS,
} = require('../.tmp-test/src/native/domain/credentials/credentialSharing');
const {
  formatDidForDisplay,
} = require('../.tmp-test/src/native/domain/credentials/credentialDisplay');

describe('credentialSharing', () => {
  it('serializes only an opaque short-lived reference without credential data', () => {
    const reference = createTemporaryQrReference({
      createdAt: Date.parse('2026-07-23T00:00:00.000Z'),
      purpose: 'credential-presentation',
      requestId: 'request-123',
    });

    const value = serializeTemporaryQrReference(reference);

    assert.match(value, /^identra:\/\/credential-presentation\?/);
    assert.match(value, /request=request-123/);
    assert.doesNotMatch(value, /credentialId|holder|attributes|fullName|Nguyen/i);
  });

  it('calculates the countdown and treats the exact deadline as expired', () => {
    const createdAt = Date.parse('2026-07-23T00:00:00.000Z');
    const reference = createTemporaryQrReference({
      createdAt,
      purpose: 'connection-invitation',
      requestId: 'request-456',
    });

    assert.equal(getTemporaryQrRemainingSeconds(createdAt, createdAt), TEMPORARY_QR_TTL_MS / 1000);
    assert.equal(getTemporaryQrRemainingSeconds(createdAt, createdAt + TEMPORARY_QR_TTL_MS - 1), 1);
    assert.equal(getTemporaryQrRemainingSeconds(createdAt, createdAt + TEMPORARY_QR_TTL_MS), 0);
    assert.equal(isTemporaryQrReferenceExpired(reference, createdAt + TEMPORARY_QR_TTL_MS - 1), false);
    assert.equal(isTemporaryQrReferenceExpired(reference, createdAt + TEMPORARY_QR_TTL_MS), true);
  });

  it('rejects invalid lifetimes', () => {
    assert.throws(
      () =>
        createTemporaryQrReference({
          createdAt: 0,
          purpose: 'credential-presentation',
          requestId: 'request-789',
          ttlMs: 0,
        }),
      /TTL must be positive/,
    );
  });

  it('returns exactly the approved attributes from the credential source', () => {
    const attributes = [
      { key: 'subject.fullName', label: 'Full Name', value: 'Nguyễn Văn An', sensitive: true },
      { key: 'degree.major', label: 'Major', value: 'Software Engineering' },
      { key: 'degree.gpa', label: 'GPA', value: '3.85' },
    ];

    const selected = selectApprovedCredentialAttributes(
      attributes,
      ['degree.gpa', 'subject.fullName', 'unknown.key'],
    );

    assert.deepEqual(selected, [attributes[0], attributes[2]]);
    assert.notEqual(selected[0], attributes[0]);
  });
});

describe('credentialDisplay', () => {
  it('compacts long DIDs without changing the underlying value', () => {
    const did = 'did:identra:1234567890abcdefghijklmnopqrstuvwxyz';

    assert.equal(formatDidForDisplay(did, false), did);
    assert.equal(formatDidForDisplay(did, true), 'did:identra:123…tuvwxyz');
    assert.equal(formatDidForDisplay('did:identra:short', true), 'did:identra:short');
  });
});
