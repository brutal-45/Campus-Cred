import { NextRequest, NextResponse } from 'next/server';
import { createAndSendOtp } from '@/lib/otp-service';

/**
 * POST /api/auth/send-email-otp
 * Send a 6-digit OTP via email.
 *
 * Body: { email: string, purpose?: string }
 * - email: Valid email address
 * - purpose: "registration" | "verification" | "login" | "forgot-password" | "2fa" (default: "verification")
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose = 'verification' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create and send OTP via shared service
    const result = await createAndSendOtp(email.toLowerCase().trim(), 'email', purpose);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error?.includes('Too many') ? 429 : 400 }
      );
    }

    // Determine if we should return the OTP in the response
    // - Always return OTP in development mode
    // - Return OTP when EMAIL_PROVIDER=console (emails aren't actually sent, user needs to see OTP)
    const emailProvider = process.env.EMAIL_PROVIDER || 'console';
    const shouldReturnOtp = process.env.NODE_ENV === 'development' || emailProvider === 'console';

    return NextResponse.json(
      {
        message: 'OTP sent successfully to your email',
        expiresIn: result.expiresIn,
        maskedEmail: result.maskedTarget,
        // When email provider is console, OTP isn't actually emailed — return it so the UI can display it
        ...(shouldReturnOtp && {
          otp: (await getLatestOtp(email.toLowerCase().trim(), 'email', purpose)),
          _note: emailProvider === 'console'
            ? 'Email provider is set to "console". OTP shown on screen. Set EMAIL_PROVIDER=resend or smtp to send real emails.'
            : 'OTP returned in development mode only.',
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send email OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get the latest OTP from DB (used when email provider is console or in dev mode)
 */
async function getLatestOtp(target: string, type: string, purpose: string): Promise<string | null> {
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
