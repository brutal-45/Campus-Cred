import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'college') {
      return NextResponse.json({ error: 'Forbidden: College access required' }, { status: 403 });
    }

    const college = await db.college.findUnique({
      where: { userId: payload.userId },
    });
    if (!college) {
      return NextResponse.json({ error: 'College profile not found' }, { status: 404 });
    }

    // Get students from this college
    const students = await db.user.findMany({
      where: {
        role: 'student',
        college: { contains: college.collegeName, mode: 'insensitive' },
      },
      select: {
        id: true,
        campusCredScore: true,
        level: true,
        branch: true,
        degree: true,
        streakDays: true,
        isVerified: true,
        _count: {
          select: {
            submissions: true,
            certificates: true,
          },
        },
      },
    });

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.campusCredScore > 0).length;
    const avgScore = totalStudents > 0
      ? Math.round(students.reduce((sum, s) => sum + s.campusCredScore, 0) / totalStudents)
      : 0;
    const totalCertificates = students.reduce((sum, s) => sum + s._count.certificates, 0);
    const totalTasksCompleted = students.reduce((sum, s) => sum + s._count.submissions, 0);

    // Level distribution
    const levelDistribution: Record<string, number> = {};
    students.forEach((s) => {
      levelDistribution[s.level] = (levelDistribution[s.level] || 0) + 1;
    });

    // Branch performance
    const branchMap: Record<string, { count: number; totalScore: number; certs: number }> = {};
    students.forEach((s) => {
      if (!s.branch) return;
      if (!branchMap[s.branch]) {
        branchMap[s.branch] = { count: 0, totalScore: 0, certs: 0 };
      }
      branchMap[s.branch].count += 1;
      branchMap[s.branch].totalScore += s.campusCredScore;
      branchMap[s.branch].certs += s._count.certificates;
    });

    const branchPerformance = Object.entries(branchMap).map(([branch, data]) => ({
      branch,
      students: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      certificates: data.certs,
    }));

    // Engagement metrics
    const verifiedCount = students.filter((s) => s.isVerified).length;
    const engagementRate = totalStudents > 0
      ? Math.round((activeStudents / totalStudents) * 100)
      : 0;

    // Completion rate (students with at least 1 submission)
    const studentsWithSubmissions = students.filter((s) => s._count.submissions > 0).length;
    const completionRate = totalStudents > 0
      ? Math.round((studentsWithSubmissions / totalStudents) * 100)
      : 0;

    return NextResponse.json({
      totalStudents,
      activeStudents,
      avgScore,
      totalCertificates,
      totalTasksCompleted,
      certificatesPerStudent: totalStudents > 0 ? Math.round((totalCertificates / totalStudents) * 10) / 10 : 0,
      tasksPerStudent: totalStudents > 0 ? Math.round((totalTasksCompleted / totalStudents) * 10) / 10 : 0,
      engagementRate,
      completionRate,
      avgStreak: totalStudents > 0
        ? Math.round((students.reduce((sum, s) => sum + s.streakDays, 0) / totalStudents) * 10) / 10
        : 0,
      levelDistribution,
      branchPerformance,
      placementRate: 68, // Placeholder - would need hiring data
    });
  } catch (error) {
    console.error('Error fetching college analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
