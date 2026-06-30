const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  AUTH_OTP_LIFETIME_SECONDS,
  AUTH_OTP_RESEND_COOLDOWN_SECONDS,
  DEMO_VALID_OTP_CODE,
  getPasswordRequirements,
  getPasswordValidationResult,
  getOtpVerificationResult,
  isPasswordStrong,
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

  it('keeps OTP resend unavailable for the approved cooldown window', () => {
    assert.equal(AUTH_OTP_RESEND_COOLDOWN_SECONDS, 60);
  });

  it('reports password requirement status independently', () => {
    assert.deepEqual(getPasswordRequirements('Abcdef1!'), {
      length: true,
      lowercase: true,
      number: true,
      special: true,
      uppercase: true,
    });
    assert.equal(isPasswordStrong('abcdef12'), false);
  });

  it('allows registration to continue only with a strong matching password', () => {
    assert.equal(getPasswordValidationResult('', ''), 'missing');
    assert.equal(getPasswordValidationResult('abcdef12', 'abcdef12'), 'weak');
    assert.equal(getPasswordValidationResult('Abcdef1!', 'Abcdef1?'), 'mismatch');
    assert.equal(getPasswordValidationResult('Abcdef1!', 'Abcdef1!'), 'valid');
  });
});
