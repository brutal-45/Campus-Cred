import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Parse request body for feedback
    const body = await req.json();
    const { feedback } = body;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required when rejecting a submission' },
        { status: 400 }
      );
    }

    // Find the submission
    const submission = await db.submission.findUnique({
      where: { id },
      include: {
        student: true,
        task: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status === 'Rejected') {
      return NextResponse.json({ error: 'Submission already rejected' }, { status: 400 });
    }

    // Update submission status
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
        status: 'Rejected',
        feedback: feedback.trim(),
        reviewedBy: payload.userId,
        reviewedAt: new Date(),
      },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: submission.studentId,
        message: `Your submission for "${submission.task.title}" has been rejected. Feedback: ${feedback.trim()}`,
        type: 'error',
      },
    });

    return NextResponse.json({
      message: 'Submission rejected with feedback',
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return NextResponse.json({ error: 'Failed to reject submission' }, { status: 500 });
  }
}
