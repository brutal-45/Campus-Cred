import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/daily-challenges
 * Returns today's challenge tasks (Task.isChallenge) from the database.
 * Admins create them via POST /api/tasks with isChallenge: true.
 * (Previously returned a hardcoded list disconnected from real tasks,
 * so completing a "challenge" could never be submitted or rewarded.)
 */
export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Challenges scheduled for today, still before their deadline. If none
    // are scheduled today, fall back to the most recent active challenges
    // so the page is useful instead of empty.
    let rows = await db.task.findMany({
      where: {
        isChallenge: true,
        isActive: true,
        deadline: { gte: now },
        challengeDate: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        _count: { select: { submissions: true } },
        submissions: { where: { status: 'Approved' }, select: { id: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (rows.length === 0) {
      rows = await db.task.findMany({
        where: { isChallenge: true, isActive: true, deadline: { gte: now } },
        include: {
          _count: { select: { submissions: true } },
          submissions: { where: { status: 'Approved' }, select: { id: true } },
        },
        orderBy: { challengeDate: 'desc' },
        take: 20,
      });
    }

    const challenges = rows.map((t) => {
      const hours = Number.parseFloat(t.estimatedHours || '');
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category ? t.category[0].toUpperCase() + t.category.slice(1) : 'General',
        difficulty: t.difficulty,
        points: t.points,
        xpReward: t.points,
        timeLimit: Number.isFinite(hours) && hours > 0 ? Math.round(hours * 3600) : 3600,
        completedBy: t.submissions.length,
        totalParticipants: t._count.submissions,
        expiresAt: t.deadline.toISOString(),
        deadline: t.deadline,
        challengeDate: t.challengeDate,
      };
    });

    return NextResponse.json({
      challenges,
      meta: {
        date: now.toISOString().split('T')[0],
        totalChallenges: challenges.length,
        refreshAt: endOfDay.toISOString(),
      },
    });
  } catch (error) {
    console.error('Daily challenges fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
