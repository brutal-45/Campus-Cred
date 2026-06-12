import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Require Bearer token auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { enable, method } = body;

    if (typeof enable !== 'boolean') {
      return NextResponse.json(
        { error: 'enable (boolean) is required' },
        { status: 400 }
      );
    }

    if (enable && (!method || !['email', 'app'].includes(method))) {
      return NextResponse.json(
        { error: 'method must be "email" or "app" when enabling 2FA' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (enable) {
      if (method === 'app') {
        // Generate a TOTP secret
        const secret = crypto.randomBytes(20).toString('base64');

        // Create a placeholder QR code URL
        const qrCodeUrl = `otpauth://totp/CampusCred:${user.email}?secret=${secret}&issuer=CampusCred`;

        await db.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: true,
            twoFactorMethod: 'app',
            twoFactorSecret: secret,
          },
        });

        return NextResponse.json({
          message: '2FA enabled with authenticator app',
          secret,
          qrCodeUrl,
        });
      }

      if (method === 'email') {
        await db.user.update({
          where: { id: user.id },
          data: {
            twoFactorEnabled: true,
            twoFactorMethod: 'email',
            twoFactorSecret: null,
          },
        });

        return NextResponse.json({
          message: '2FA enabled with email verification',
        });
      }
    } else {
      // Disable 2FA
      await db.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorMethod: null,
          twoFactorSecret: null,
        },
      });

      return NextResponse.json({
        message: '2FA disabled',
      });
    }
  } catch (error) {
    console.error('2FA settings error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
