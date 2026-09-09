import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

// Server-side OTP helpers — all OTP generation/verification now happens in
// Cloud Functions (functions/src/otp.ts). Clients never touch temp_otps.
const functionsInstance = getFunctions(getApp());

export type OtpPurpose = 'register' | 'password_reset' | 'contact' | 'admin_login' | 'delete_account';

export async function requestOtp(
  email: string,
  purpose: OtpPurpose,
  captchaToken?: string
): Promise<void> {
  const fn = httpsCallable(functionsInstance, 'requestOtp');
  await fn({ email, purpose, captchaToken });
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose): Promise<void> {
  const fn = httpsCallable(functionsInstance, 'verifyOtp');
  await fn({ email, code, purpose });
}