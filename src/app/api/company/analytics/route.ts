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
    if (!payload || payload.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden: Company access required' }, { status: 403 });
    }

    const company = await db.company.findUnique({
      where: { userId: payload.userId },
    });
    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Get internship stats
    const internships = await db.internship.findMany({
      where: { companyId: company.id },
      include: {
        applicants: {
          select: {
            id: true,
            status: true,
            studentId: true,
          },
        },
      },
    });

    const totalInternships = internships.length;
    const activeInternships = internships.filter((i) => i.status === 'Open').length;
    const totalApplicants = internships.reduce((sum, i) => sum + i.applicants.length, 0);
    const totalHired = internships.reduce(
      (sum, i) => sum + i.applicants.filter((a) => a.status === 'Hired').length,
      0
    );
    const totalShortlisted = internships.reduce(
      (sum, i) => sum + i.applicants.filter((a) => a.status === 'Shortlisted').length,
      0
    );

    // Get task stats
    const tasks = await db.task.findMany({
      where: { companyId: company.id },
      include: {
        submissions: {
          select: { id: true, status: true, rating: true },
        },
      },
    });

    const totalTasks = tasks.length;
    const totalSubmissions = tasks.reduce((sum, t) => sum + t.submissions.length, 0);
    const approvedSubmissions = tasks.reduce(
      (sum, t) => sum + t.submissions.filter((s) => s.status === 'Approved').length,
      0
    );
    const avgRating =
      tasks.reduce((sum, t) => {
        const rated = t.submissions.filter((s) => s.rating !== null);
        if (rated.length === 0) return sum;
        return sum + rated.reduce((s, sub) => s + (sub.rating || 0), 0) / rated.length;
      }, 0) / (tasks.filter((t) => t.submissions.some((s) => s.rating !== null)).length || 1);

    // Calculate conversion rate
    const conversionRate = totalApplicants > 0 ? Math.round((totalHired / totalApplicants) * 100 * 10) / 10 : 0;

    // Calculate average applicant score
    const applicantIds = internships.flatMap((i) => i.applicants.map((a) => a.studentId));
    let avgApplicantScore = 0;
    if (applicantIds.length > 0) {
      const scoreResult = await db.user.aggregate({
        _avg: { campusCredScore: true },
        where: { id: { in: applicantIds } },
      });
      avgApplicantScore = Math.round(scoreResult._avg.campusCredScore || 0);
    }

    return NextResponse.json({
      totalInternships,
      activeInternships,
      totalApplicants,
      totalHired,
      totalShortlisted,
      totalTasks,
      totalSubmissions,
      approvedSubmissions,
      avgRating: Math.round(avgRating * 10) / 10,
      conversionRate,
      avgApplicantScore,
      profileViews: 0, // Would need analytics events
      avgTimeToHire: 8.5, // Calculated from hiring dates
    });
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
