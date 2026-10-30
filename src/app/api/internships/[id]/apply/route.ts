import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

/**
 * POST /api/internships/[id]/apply
 * Lets an authenticated student apply to an open internship.
 * (This endpoint did not exist — the application workflow was missing.)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    if (payload.role !== 'student') {
      return NextResponse.json({ error: 'Only students can apply to internships' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const coverLetter = typeof body?.coverLetter === 'string' ? body.coverLetter : null;

    const internship = await db.internship.findUnique({ where: { id } });
    if (!internship) {
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }
    if (internship.status !== 'Open') {
      return NextResponse.json({ error: 'This internship is no longer accepting applications' }, { status: 400 });
    }
    if (new Date(internship.deadline) < new Date()) {
      return NextResponse.json({ error: 'The application deadline for this internship has passed' }, { status: 400 });
    }

    const existing = await db.internshipApplicant.findFirst({
      where: { internshipId: id, studentId: payload.userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this internship', application: existing },
        { status: 409 }
      );
    }

    const application = await db.internshipApplicant.create({
      data: {
        internshipId: id,
        studentId: payload.userId,
        coverLetter,
        status: 'Applied',
      },
    });

    return NextResponse.json(
      { message: 'Application submitted successfully', application },
      { status: 201 }
    );
  } catch (error) {
    console.error('Internship apply error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
