import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Try to get refresh token from body first
    let body: { refreshToken?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is ok
    }

    let { refreshToken } = body;

    // Also check cookie if no refresh token in body
    if (!refreshToken) {
      const cookie = req.cookies.get('cc_refresh');
      refreshToken = cookie?.value;
    }

    // Try to verify access token (optional — don't block logout if expired)
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.split(' ')[1];
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        userId = payload.userId as string;
      }
    }

    // Delete session record if we have a refresh token
    if (refreshToken) {
      await db.session.deleteMany({
        where: { refreshToken },
      }).catch(() => {}); // Don't fail if session already deleted
    }

    // If we identified the user, also delete all their sessions for security
    if (userId) {
      await db.session.deleteMany({
        where: { userId },
      }).catch(() => {});
    }

    // Always clear the refresh cookie
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
    // Even on error, clear the cookie and return success
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
  }
}
