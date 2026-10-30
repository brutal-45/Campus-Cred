import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

/**
 * GET /api/student/internships
 * Returns the authenticated student's own internship applications.
 * (The dashboard previously fetched the public internship list and
 * mislabelled it as "My Internships".)
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

    const applications = await db.internshipApplicant.findMany({
      where: { studentId: payload.userId },
      include: {
        internship: {
          include: {
            company: {
              select: { id: true, companyName: true, logoUrl: true, industry: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const internships = applications.map((app) => ({
      applicationId: app.id,
      status: app.status,
      appliedAt: app.appliedAt,
      id: app.internship.id,
      title: app.internship.title,
      company: app.internship.company.companyName,
      companyLogo: app.internship.company.logoUrl,
      duration: app.internship.duration,
      stipend: app.internship.stipend,
      isPaid: app.internship.isPaid,
      location: app.internship.location,
      isRemote: app.internship.isRemote,
      deadline: app.internship.deadline,
    }));

    // Convenience list so listing pages can mark internships as applied.
    const appliedIds = applications.map((app) => app.internshipId);

    return NextResponse.json({ internships, applications, appliedIds });
  } catch (error) {
    console.error('Student internships fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch your internship applications' }, { status: 500 });
  }
}
