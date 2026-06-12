import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Total counts
    const [totalStudents, totalSubmissions, totalCertificates, activeTasks] =
      await Promise.all([
        db.user.count({ where: { role: 'student' } }),
        db.submission.count(),
        db.certificate.count(),
        db.task.count({ where: { isActive: true } }),
      ]);

    // Submissions per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissionsRaw = await db.submission.findMany({
      where: { submittedAt: { gte: thirtyDaysAgo } },
      select: { submittedAt: true },
    });

    // Group submissions by day
    const submissionsByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const key = date.toISOString().split('T')[0];
      submissionsByDay[key] = 0;
    }

    submissionsRaw.forEach((sub) => {
      const key = sub.submittedAt.toISOString().split('T')[0];
      if (submissionsByDay[key] !== undefined) {
        submissionsByDay[key]++;
      }
    });

    const submissionsPerDay = Object.entries(submissionsByDay).map(
      ([date, count]) => ({ date, count })
    );

    // Certificates by branch
    const certificatesRaw = await db.certificate.findMany({
      select: { branch: true },
    });

    const certificatesByBranchMap: Record<string, number> = {};
    certificatesRaw.forEach((cert) => {
      certificatesByBranchMap[cert.branch] =
        (certificatesByBranchMap[cert.branch] || 0) + 1;
    });

    const certificatesByBranch = Object.entries(certificatesByBranchMap)
      .map(([branch, count]) => ({ branch, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Students by degree
    const studentsRaw = await db.user.findMany({
      where: { role: 'student', degree: { not: null } },
      select: { degree: true },
    });

    const studentsByDegreeMap: Record<string, number> = {};
    studentsRaw.forEach((student) => {
      if (student.degree) {
        studentsByDegreeMap[student.degree] =
          (studentsByDegreeMap[student.degree] || 0) + 1;
      }
    });

    const studentsByDegree = Object.entries(studentsByDegreeMap)
      .map(([degree, count]) => ({ degree, count }))
      .sort((a, b) => b.count - a.count);

    // Top performing branches (by average points)
    const branchesRaw = await db.user.findMany({
      where: { role: 'student', branch: { not: null } },
      select: { branch: true, points: true },
    });

    const branchesStatsMap: Record<string, { total: number; count: number }> = {};
    branchesRaw.forEach((student) => {
      if (student.branch) {
        if (!branchesStatsMap[student.branch]) {
          branchesStatsMap[student.branch] = { total: 0, count: 0 };
        }
        branchesStatsMap[student.branch].total += student.points;
        branchesStatsMap[student.branch].count++;
      }
    });

    const topBranches = Object.entries(branchesStatsMap)
      .map(([branch, { total, count }]) => ({
        branch,
        avgPoints: Math.round(total / count),
      }))
      .sort((a, b) => b.avgPoints - a.avgPoints)
      .slice(0, 8);

    return NextResponse.json({
      totalStudents,
      totalSubmissions,
      totalCertificates,
      activeTasks,
      submissionsPerDay,
      certificatesByBranch,
      studentsByDegree,
      topBranches,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
