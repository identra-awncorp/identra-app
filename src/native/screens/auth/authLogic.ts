export const AUTH_OTP_LENGTH = 6;
export const AUTH_OTP_LIFETIME_SECONDS = 5 * 60;
export const AUTH_OTP_RESEND_COOLDOWN_SECONDS = 60;
export const DEMO_VALID_OTP_CODE = '000000';
export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 128;

export type OtpVerificationResult = 'incomplete' | 'expired' | 'invalid' | 'valid';
export type PasswordRequirementKey = 'ascii' | 'length' | 'noEdgeWhitespace';
export type PasswordValidationResult = 'missing' | 'mismatch' | 'valid' | 'weak';

export const AUTH_PASSWORD_REQUIREMENTS: PasswordRequirementKey[] = [
  'length',
  'noEdgeWhitespace',
  'ascii',
];

export function sanitizeOtpInput(value: string) {
  return value.replace(/\D/g, '').slice(0, AUTH_OTP_LENGTH);
}

export function getOtpVerificationResult(
  otp: string,
  remainingSeconds: number,
  validCode: string | null = DEMO_VALID_OTP_CODE,
): OtpVerificationResult {
  const normalizedOtp = sanitizeOtpInput(otp);

  if (normalizedOtp.length !== AUTH_OTP_LENGTH) return 'incomplete';
  if (remainingSeconds <= 0) return 'expired';
  if (validCode === null) return 'valid';
  if (normalizedOtp !== validCode) return 'invalid';
  return 'valid';
}

export function getPasswordRequirements(password: string): Record<PasswordRequirementKey, boolean> {
  return {
    ascii: /^[\x20-\x7E]*$/.test(password),
    length: Array.from(password).length >= AUTH_PASSWORD_MIN_LENGTH && Array.from(password).length <= AUTH_PASSWORD_MAX_LENGTH,
    noEdgeWhitespace: password === password.trim(),
  };
}

export function isPasswordStrong(password: string) {
  const requirements = getPasswordRequirements(password);
  return AUTH_PASSWORD_REQUIREMENTS.every((key) => requirements[key]);
}

export function getPasswordValidationResult(password: string, confirmation: string): PasswordValidationResult {
  if (!password || !confirmation) return 'missing';
  if (!isPasswordStrong(password)) return 'weak';
  if (password !== confirmation) return 'mismatch';
  return 'valid';
}
