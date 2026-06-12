import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
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

    // Get user security info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        twoFactorEnabled: true,
        twoFactorMethod: true,
        deletionRequestedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Count active sessions
    const activeSessions = await db.session.count({
      where: {
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    // Get last 10 login history records
    const lastLogins = await db.loginHistory.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        ipAddress: true,
        device: true,
        location: true,
        success: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod,
      activeSessions,
      lastLogins,
      deletionRequestedAt: user.deletionRequestedAt,
    });
  } catch (error) {
    console.error('Get security info error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
