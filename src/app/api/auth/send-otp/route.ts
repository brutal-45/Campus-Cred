import { NextRequest, NextResponse } from 'next/server';
import { createAndSendOtp } from '@/lib/otp-service';
import { cleanPhone, isValidIndianPhone } from '@/lib/sms';

/**
 * POST /api/auth/send-otp
 * Send a 6-digit OTP via SMS to an Indian phone number.
 *
 * Body: { phone: string, purpose?: string }
 * - phone: 10-digit Indian number (with or without +91 prefix)
 * - purpose: "registration" | "verification" | "login" | "forgot-password" | "2fa" (default: "verification")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, purpose = 'verification' } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate Indian phone number
    const digits = cleanPhone(phone);
    if (!isValidIndianPhone(digits)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian phone number starting with 6-9' },
        { status: 400 }
      );
    }

    // Create and send OTP via shared service
    const result = await createAndSendOtp(digits, 'phone', purpose);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('Too many') ? 429 : 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'OTP sent successfully via SMS',
        expiresIn: result.expiresIn,
        maskedPhone: result.maskedTarget,
        // In development, also return OTP for easy testing
        ...(process.env.NODE_ENV === 'development' && {
          otp: (await getLatestOtp(digits, 'phone', purpose)),
          _devNote: 'OTP returned in development mode only. Use SMS_PROVIDER=msg91 or twilio for production.',
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Dev helper: Get the latest OTP from DB (only used in development)
 */
async function getLatestOtp(target: string, type: string, purpose: string): Promise<string | null> {
  if (process.env.NODE_ENV !== 'development') return null;
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const record = await prisma.otpVerification.findFirst({
      where: { target, type, purpose, isVerified: false },
      orderBy: { createdAt: 'desc' },
      select: { otp: true },
    });
    return record?.otp || null;
  } catch {
    return null;
  }
}
