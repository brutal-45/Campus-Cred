import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Verify access token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.split(' ')[1];
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get refresh token from body or cookie
    const body = await req.json().catch(() => ({}));
    let { refreshToken } = body;

    if (!refreshToken) {
      const cookie = req.cookies.get('cc_refresh');
      refreshToken = cookie?.value;
    }

    // If refreshToken provided, delete the session record
    if (refreshToken) {
      await db.session.deleteMany({
        where: { refreshToken },
      });
    }

    // Set the cc_refresh cookie to empty/expired
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    response.cookies.set('cc_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
