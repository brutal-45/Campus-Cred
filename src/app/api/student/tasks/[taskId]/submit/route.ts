import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
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

    const { taskId } = await params;
    const body = await req.json();
    const { fileUrl, externalLink, description } = body;

    // Validate at least one submission method
    if (!fileUrl && !externalLink) {
      return NextResponse.json(
        { error: 'Please provide either a file or an external link' },
        { status: 400 }
      );
    }

    // Check if task exists and is active
    const task = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!task.isActive) {
      return NextResponse.json({ error: 'This task is no longer accepting submissions' }, { status: 400 });
    }

    // Check if deadline has passed
    if (new Date(task.deadline) < new Date()) {
      return NextResponse.json({ error: 'The deadline for this task has passed' }, { status: 400 });
    }

    // Check if user already has a pending or approved submission
    const existingSubmission = await db.submission.findFirst({
      where: {
        studentId: payload.userId,
        taskId: taskId,
        status: { in: ['Pending', 'Under Review', 'Approved'] },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this task', submission: existingSubmission },
        { status: 409 }
      );
    }

    // Validate word count for description
    if (description) {
      const wordCount = description.trim().split(/\s+/).length;
      if (wordCount > 300) {
        return NextResponse.json(
          { error: 'Description must be 300 words or less' },
          { status: 400 }
        );
      }
    }

    // Create submission
    const submission = await db.submission.create({
      data: {
        studentId: payload.userId,
        taskId: taskId,
        fileUrl: fileUrl || null,
        externalLink: externalLink || null,
        description: description || null,
        status: 'Pending',
      },
    });

    return NextResponse.json({
      message: 'Task submitted successfully!',
      submission: {
        id: submission.id,
        taskId: submission.taskId,
        fileUrl: submission.fileUrl,
        externalLink: submission.externalLink,
        description: submission.description,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Task submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    );
  }
}
