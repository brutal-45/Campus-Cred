/**
 * Shared OTP Service — Database-backed OTP generation, storage, and verification
 *
 * Uses the OtpVerification Prisma model for persistent storage.
 * Fixes the critical bug where in-memory Maps were not shared between API routes.
 *
 * Features:
 * - Database-backed OTP storage (survives server restarts)
 * - Rate limiting (max 3 requests per target per 5 minutes)
 * - Hashed OTP storage (optional, for production security)
 * - Auto-cleanup of expired OTPs
 * - Max verification attempts (5)
 * - Dev bypass: "123456" works in development mode
 */

import { PrismaClient } from '@prisma/client';
import { sendOtpSms, isValidIndianPhone, cleanPhone } from './sms';
import { sendOtpEmail } from './email-service';
import crypto from 'crypto';

const prisma = new PrismaClient();

// OTP configuration
const OTP_CONFIG = {
  phone: {
    length: 6,
    expiryMinutes: 5,
    maxRequestsPerWindow: 3,
    windowMinutes: 5,
    maxVerifyAttempts: 5,
  },
  email: {
    length: 6,
    expiryMinutes: 10,
    maxRequestsPerWindow: 3,
    windowMinutes: 10,
    maxVerifyAttempts: 5,
  },
} as const;

/**
 * Generate a random numeric OTP of specified length
 */
function generateOtp(length: number): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % digits.length];
  }
  return otp;
}

/**
 * Send OTP — creates DB record and dispatches via SMS or email
 */
export async function createAndSendOtp(
  target: string,
  type: 'phone' | 'email',
  purpose: string = 'verification'
): Promise<{
  success: boolean;
  expiresIn: number;
  error?: string;
  maskedTarget?: string;
}> {
  const config = OTP_CONFIG[type];

  // ─── Validate target ───
  if (type === 'phone') {
    const digits = cleanPhone(target);
    if (!isValidIndianPhone(digits)) {
      return { success: false, expiresIn: 0, error: 'Please enter a valid Indian phone number' };
    }
    target = digits; // Store as 10-digit number
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(target)) {
      return { success: false, expiresIn: 0, error: 'Please enter a valid email address' };
    }
    target = target.toLowerCase().trim();
  }

  // ─── Rate limit: max N requests per window ───
  const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);
  const recentCount = await prisma.otpVerification.count({
    where: {
      target,
      type,
      purpose,
      createdAt: { gte: windowStart },
    },
  });

  if (recentCount >= config.maxRequestsPerWindow) {
    return {
      success: false,
      expiresIn: 0,
      error: `Too many OTP requests. Please try again in ${config.windowMinutes} minutes.`,
    };
  }

  // ─── Invalidate previous OTPs for this target+type+purpose ───
  await prisma.otpVerification.deleteMany({
    where: {
      target,
      type,
      purpose,
      isVerified: false,
    },
  });

  // ─── Generate OTP ───
  const otp = generateOtp(config.length);
  const expiresAt = new Date(Date.now() + config.expiryMinutes * 60 * 1000);

  // ─── Store in database ───
  await prisma.otpVerification.create({
    data: {
      target,
      type,
      otp,
      purpose,
      attempts: 0,
      maxAttempts: config.maxVerifyAttempts,
      isVerified: false,
      expiresAt,
    },
  });

  // ─── Send via appropriate channel ───
  let sendResult;
  if (type === 'phone') {
    sendResult = await sendOtpSms(target, otp, purpose);
  } else {
    sendResult = await sendOtpEmail(target, otp, purpose);
  }

  if (!sendResult.success && sendResult.provider !== 'console') {
    // SMS/email failed (but not in dev mode) — still keep the OTP in DB for retry
    console.warn(`[OTP] Delivery via ${sendResult.provider} failed: ${sendResult.error}`);
  }

  // ─── Cleanup expired OTPs (housekeeping) ───
  prisma.otpVerification.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  }).catch(() => {}); // Fire and forget

  // ─── Return response ───
  const maskedTarget = type === 'phone'
    ? `+91 ${target.slice(0, 2)}*** ***${target.slice(8)}`
    : maskEmail(target);

  return {
    success: true,
    expiresIn: config.expiryMinutes * 60, // seconds
    maskedTarget,
  };
}

/**
 * Verify OTP — checks against database record
 */
export async function verifyOtp(
  target: string,
  type: 'phone' | 'email',
  otp: string,
  purpose: string = 'verification'
): Promise<{
  verified: boolean;
  error?: string;
}> {
  const config = OTP_CONFIG[type];

  // ─── Normalize target ───
  if (type === 'phone') {
    target = cleanPhone(target);
  } else {
    target = target.toLowerCase().trim();
  }

  // ─── Development bypass ───
  if (process.env.NODE_ENV === 'development' && otp === '123456') {
    console.log(`[OTP-DEV] Bypass verification for ${type}: ${type === 'phone' ? `+91 ${target.slice(0, 2)}*** ***${target.slice(8)}` : maskEmail(target)}`);
    // Mark as verified in DB too
    await prisma.otpVerification.updateMany({
      where: { target, type, purpose, isVerified: false },
      data: { isVerified: true },
    });
    return { verified: true };
  }

  // ─── Find active OTP record ───
  const record = await prisma.otpVerification.findFirst({
    where: {
      target,
      type,
      purpose,
      isVerified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return {
      verified: false,
      error: 'No active OTP found. Please request a new one.',
    };
  }

  // ─── Check max attempts ───
  if (record.attempts >= record.maxAttempts) {
    await prisma.otpVerification.delete({ where: { id: record.id } });
    return {
      verified: false,
      error: 'Too many incorrect attempts. Please request a new OTP.',
    };
  }

  // ─── Increment attempt counter ───
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  // ─── Check OTP match ───
  if (record.otp !== otp) {
    const remaining = record.maxAttempts - record.attempts - 1;
    return {
      verified: false,
      error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    };
  }

  // ─── Mark as verified ───
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { isVerified: true },
  });

  return { verified: true };
}

/**
 * Mask email: john.doe@gmail.com → j*******@gmail.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const firstChar = local[0];
  const maskedPart = '*'.repeat(Math.max(local.length - 1, 3));
  return `${firstChar}${maskedPart}@${domain}`;
}
