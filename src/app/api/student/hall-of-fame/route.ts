import { NextRequest, NextResponse } from 'next/server';
import { getHallOfFame } from '@/lib/score-service';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');

    // Get Hall of Fame students
    const students = await getHallOfFame(branch || undefined);

    // If no branch specified, group by branch (top 10 per branch)
    if (!branch) {
      // Get all branches that have students with scores
      const branches = await db.user.findMany({
        where: {
          role: 'student',
          isVerified: true,
          campusCredScore: { gt: 0 },
          branch: { not: null },
        },
        select: { branch: true },
        distinct: ['branch'],
        orderBy: { branch: 'asc' },
      });

      const branchWiseHallOfFame = await Promise.all(
        branches.map(async (b) => {
          const branchStudents = await getHallOfFame(b.branch!);
          return {
            branch: b.branch,
            students: branchStudents,
          };
        })
      );

      return NextResponse.json({
        type: 'all-branches',
        branches: branchWiseHallOfFame,
        topOverall: students.slice(0, 10),
      });
    }

    return NextResponse.json({
      type: 'single-branch',
      branch,
      students,
    });
  } catch (error: any) {
    console.error('Hall of Fame error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Hall of Fame' }, { status: 500 });
  }
}
