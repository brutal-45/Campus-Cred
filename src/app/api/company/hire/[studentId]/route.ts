import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
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

    const { studentId } = await params;

    // Find company by userId
    const company = await db.company.findUnique({
      where: { userId: payload.userId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // Verify the student exists
    const student = await db.user.findUnique({
      where: { id: studentId, role: 'student' },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get the applicant ID from the request body
    const body = await req.json();
    const { applicantId } = body;

    if (!applicantId) {
      return NextResponse.json({ error: 'Applicant ID is required' }, { status: 400 });
    }

    // Find the applicant and verify it belongs to company's internship
    const applicant = await db.internshipApplicant.findUnique({
      where: { id: applicantId },
      include: { internship: true },
    });

    if (!applicant || applicant.internship.companyId !== company.id) {
      return NextResponse.json({ error: 'Applicant not found or not in your internships' }, { status: 404 });
    }

    if (applicant.studentId !== studentId) {
      return NextResponse.json({ error: 'Applicant does not match the student' }, { status: 400 });
    }

    // Update the applicant status to Hired
    const updatedApplicant = await db.internshipApplicant.update({
      where: { id: applicantId },
      data: { status: 'Hired' },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: studentId,
        message: `Congratulations! You have been hired by ${company.companyName} for the "${applicant.internship.title}" internship!`,
        type: 'success',
      },
    });

    return NextResponse.json({
      message: 'Student hired successfully',
      applicant: updatedApplicant,
    });
  } catch (error) {
    console.error('Error hiring student:', error);
    return NextResponse.json({ error: 'Failed to hire student' }, { status: 500 });
  }
}
