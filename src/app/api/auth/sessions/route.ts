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

    // Get all active sessions for the user
    const sessions = await db.session.findMany({
      where: {
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastAccessedAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceInfo: true,
        ipAddress: true,
        location: true,
        createdAt: true,
        lastAccessedAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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
    const { sessionId, all } = body;

    if (all === true) {
      // Delete all sessions except the current one
      // Find current session from the access token's refresh token
      const currentSessions = await db.session.findMany({
        where: {
          userId: payload.userId,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      // Get the current session from cookie
      const cookie = req.cookies.get('cc_refresh');
      const currentRefreshToken = cookie?.value;

      if (currentRefreshToken) {
        // Delete all sessions except the one with the current refresh token
        await db.session.deleteMany({
          where: {
            userId: payload.userId,
            NOT: { refreshToken: currentRefreshToken },
          },
        });
      } else {
        // No current session cookie, delete all sessions
        await db.session.deleteMany({
          where: { userId: payload.userId },
        });
      }

      return NextResponse.json({
        message: 'All other sessions terminated successfully',
      });
    }

    if (sessionId) {
      // Delete specific session, verify it belongs to the user
      const session = await db.session.findFirst({
        where: {
          id: sessionId,
          userId: payload.userId,
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      await db.session.delete({
        where: { id: sessionId },
      });

      return NextResponse.json({
        message: 'Session terminated successfully',
      });
    }

    return NextResponse.json(
      { error: 'Provide sessionId or set all to true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
