const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  AUTH_OTP_LIFETIME_SECONDS,
  DEMO_VALID_OTP_CODE,
  getOtpVerificationResult,
  sanitizeOtpInput,
} = require('../.tmp-test/src/native/screens/auth/authLogic');

describe('authLogic', () => {
  it('keeps only six OTP digits from user input', () => {
    assert.equal(sanitizeOtpInput('12a 34-5678'), '123456');
  });

  it('requires a complete OTP before checking expiry or validity', () => {
    assert.equal(getOtpVerificationResult('12345', AUTH_OTP_LIFETIME_SECONDS), 'incomplete');
  });

  it('rejects complete OTP codes after expiry', () => {
    assert.equal(getOtpVerificationResult(DEMO_VALID_OTP_CODE, 0), 'expired');
  });

  it('rejects complete OTP codes that do not match the demo verification code', () => {
    assert.equal(getOtpVerificationResult('654321', AUTH_OTP_LIFETIME_SECONDS), 'invalid');
  });

  it('accepts only the demo verification code before expiry', () => {
    assert.equal(getOtpVerificationResult(DEMO_VALID_OTP_CODE, AUTH_OTP_LIFETIME_SECONDS), 'valid');
  });
});
