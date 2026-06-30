export const AUTH_OTP_LENGTH = 6;
export const AUTH_OTP_LIFETIME_SECONDS = 5 * 60;
export const DEMO_VALID_OTP_CODE = '123456';

export type OtpVerificationResult = 'incomplete' | 'expired' | 'invalid' | 'valid';

export function sanitizeOtpInput(value: string) {
  return value.replace(/\D/g, '').slice(0, AUTH_OTP_LENGTH);
}

export function getOtpVerificationResult(
  otp: string,
  remainingSeconds: number,
  validCode = DEMO_VALID_OTP_CODE,
): OtpVerificationResult {
  const normalizedOtp = sanitizeOtpInput(otp);

  if (normalizedOtp.length !== AUTH_OTP_LENGTH) return 'incomplete';
  if (remainingSeconds <= 0) return 'expired';
  if (normalizedOtp !== validCode) return 'invalid';
  return 'valid';
}
