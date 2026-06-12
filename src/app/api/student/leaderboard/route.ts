import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const where: Record<string, unknown> = { role: 'student' };
    if (user.branch) where.branch = user.branch;

    const students = await db.user.findMany({
      where,
      orderBy: { points: 'desc' },
      take: 10,
      select: {
        id: true,
        fullName: true,
        points: true,
        level: true,
        college: true,
        branch: true,
        streakDays: true,
      },
    });

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      ...s,
      isCurrentUser: s.id === payload.userId,
    }));

    return NextResponse.json({ leaderboard, currentUserBranch: user.branch });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
