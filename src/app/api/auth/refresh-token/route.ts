import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { refreshToken } = body;

    // Also check cookies for refreshToken
    if (!refreshToken) {
      const cookie = req.cookies.get('cc_refresh');
      refreshToken = cookie?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find session by refresh token that hasn't expired
    const session = await db.session.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired. Please log in again.' },
        { status: 401 }
      );
    }

    // Update session's lastAccessedAt
    await db.session.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() },
    });

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return NextResponse.json({
      token: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
