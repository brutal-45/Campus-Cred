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
    if (!payload || payload.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden: Company access required' }, { status: 403 });
    }

    // Find company by userId
    const company = await db.company.findUnique({
      where: { userId: payload.userId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const internships = await db.internship.findMany({
      where: { companyId: company.id },
      include: {
        applicants: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                college: true,
                branch: true,
                degree: true,
                points: true,
                level: true,
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add counts for each internship
    const internshipsWithCounts = internships.map((intern) => ({
      id: intern.id,
      title: intern.title,
      description: intern.description,
      branches: intern.branches,
      degrees: intern.degrees,
      duration: intern.duration,
      isPaid: intern.isPaid,
      stipend: intern.stipend,
      deadline: intern.deadline,
      status: intern.status,
      createdAt: intern.createdAt,
      applicantCount: intern.applicants.length,
      hiredCount: intern.applicants.filter((a) => a.status === 'Hired').length,
      applicants: intern.applicants,
    }));

    return NextResponse.json({
      internships: internshipsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden: Company access required' }, { status: 403 });
    }

    // Find company by userId
    const company = await db.company.findUnique({
      where: { userId: payload.userId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, degrees, branches, duration, isPaid, stipend, deadline } = body;

    if (!title || !description || !degrees || !branches || !deadline) {
      return NextResponse.json(
        { error: 'Title, description, degrees, branches, and deadline are required' },
        { status: 400 }
      );
    }

    const internship = await db.internship.create({
      data: {
        companyId: company.id,
        title,
        description,
        degrees: JSON.stringify(degrees),
        branches: JSON.stringify(branches),
        duration: duration || null,
        isPaid: isPaid || false,
        stipend: stipend || null,
        deadline: new Date(deadline),
        status: 'Open',
      },
    });

    return NextResponse.json({
      message: 'Internship created successfully',
      internship,
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json({ error: 'Failed to create internship' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'company') {
      return NextResponse.json({ error: 'Forbidden: Company access required' }, { status: 403 });
    }

    const body = await req.json();
    const { applicantId, status } = body;

    if (!applicantId || !status) {
      return NextResponse.json(
        { error: 'Applicant ID and status are required' },
        { status: 400 }
      );
    }

    if (!['Shortlisted', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be Shortlisted or Rejected' },
        { status: 400 }
      );
    }

    // Find company to verify ownership
    const company = await db.company.findUnique({
      where: { userId: payload.userId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Find the applicant and verify it belongs to company's internship
    const applicant = await db.internshipApplicant.findUnique({
      where: { id: applicantId },
      include: { internship: true },
    });

    if (!applicant || applicant.internship.companyId !== company.id) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    }

    const updatedApplicant = await db.internshipApplicant.update({
      where: { id: applicantId },
      data: { status },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: applicant.studentId,
        message: `Your application for "${applicant.internship.title}" has been ${status.toLowerCase()}.`,
        type: status === 'Shortlisted' ? 'success' : 'warning',
      },
    });

    return NextResponse.json({
      message: `Applicant ${status.toLowerCase()}`,
      applicant: updatedApplicant,
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json({ error: 'Failed to update applicant status' }, { status: 500 });
  }
}
