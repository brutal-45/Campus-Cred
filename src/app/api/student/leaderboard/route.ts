import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/student/leaderboard
 * Default: top students in the caller's branch (used by the dashboard widget).
 * ?branch=CSE filters a branch; ?branch=All returns the global leaderboard;
 * ?limit= controls page size (max 100).
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const branchParam = searchParams.get('branch');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), 100);

    const where: Record<string, unknown> = { role: 'student' };
    if (branchParam) {
      if (branchParam !== 'All') where.branch = branchParam;
    } else if (user.branch) {
      where.branch = user.branch;
    }

    const students = await db.user.findMany({
      where,
      orderBy: [{ campusCredScore: 'desc' }, { points: 'desc' }],
      take: limit,
      select: {
        id: true,
        fullName: true,
        points: true,
        campusCredScore: true,
        level: true,
        college: true,
        branch: true,
        streakDays: true,
        profilePhoto: true,
      },
    });

    // Approved-task counts for the listed students.
    const approvedCounts = students.length
      ? await db.submission.groupBy({
          by: ['studentId'],
          where: { studentId: { in: students.map((s) => s.id) }, status: 'Approved' },
          _count: { _all: true },
        })
      : [];
    const countByStudent = new Map(approvedCounts.map((c) => [c.studentId, c._count._all]));

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      ...s,
      score: s.campusCredScore,
      tasksCompleted: countByStudent.get(s.id) || 0,
      isCurrentUser: s.id === payload.userId,
    }));

    // Caller's own rank within the same filter (even outside the top N).
    const aheadOfMe = await db.user.count({
      where: {
        ...where,
        OR: [
          { campusCredScore: { gt: user.campusCredScore } },
          { campusCredScore: user.campusCredScore, points: { gt: user.points } },
        ],
      },
    });

    return NextResponse.json({
      leaderboard,
      currentUserBranch: user.branch,
      currentUser: {
        id: user.id,
        rank: aheadOfMe + 1,
        score: user.campusCredScore,
        points: user.points,
        level: user.level,
      },
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
