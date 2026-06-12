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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { studentId: payload.userId };
    if (status && status !== 'All') {
      where.status = status;
    }

    const submissions = await db.submission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            degree: true,
            branch: true,
            difficulty: true,
            points: true,
          },
        },
      },
    });

    const formattedSubmissions = submissions.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      taskTitle: s.task.title,
      taskPoints: s.task.points,
      status: s.status,
      feedback: s.feedback,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      pointsEarned: s.status === 'Approved' ? s.task.points : 0,
    }));

    return NextResponse.json({ submissions: formattedSubmissions });
  } catch (error) {
    console.error('Submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
