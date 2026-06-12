import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp-service';
import { cleanPhone } from '@/lib/sms';

/**
 * POST /api/auth/verify-otp
 * Verify a 6-digit OTP sent to a phone number.
 *
 * Body: { phone: string, otp: string, purpose?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, purpose = 'verification' } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    const digits = cleanPhone(phone);

    // Verify OTP via shared service (handles dev bypass, DB lookup, rate limiting)
    const result = await verifyOtp(digits, 'phone', otp, purpose);

    if (!result.verified) {
      return NextResponse.json(
        { verified: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { verified: true, message: 'Phone number verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
