import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp-service';

/**
 * POST /api/auth/verify-email-otp
 * Verify a 6-digit OTP sent to an email address.
 *
 * Body: { email: string, otp: string, purpose?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, purpose = 'verification' } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP via shared service (handles dev bypass, DB lookup, rate limiting)
    const result = await verifyOtp(normalizedEmail, 'email', otp, purpose);

    if (!result.verified) {
      return NextResponse.json(
        { verified: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { verified: true, message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
