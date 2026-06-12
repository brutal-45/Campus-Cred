import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        submissions: {
          select: {
            id: true,
            studentId: true,
            status: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if the authenticated user has already submitted
    let userSubmission = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload) {
        userSubmission = await db.submission.findFirst({
          where: {
            studentId: payload.userId,
            taskId: taskId,
          },
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            fileUrl: true,
            externalLink: true,
            description: true,
            status: true,
            feedback: true,
            submittedAt: true,
            reviewedAt: true,
          },
        });
      }
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        degree: task.degree,
        branch: task.branch,
        difficulty: task.difficulty,
        points: task.points,
        deadline: task.deadline,
        taskKitUrl: task.taskKitUrl,
        isActive: task.isActive,
        createdAt: task.createdAt,
        totalSubmissions: task.submissions.length,
      },
      userSubmission,
    });
  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Auth check - admin only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { taskId } = await params;
    const body = await req.json();

    const existingTask = await db.task.findUnique({ where: { id: taskId } });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.degree) updateData.degree = body.degree;
    if (body.branch) updateData.branch = body.branch;
    if (body.difficulty) updateData.difficulty = body.difficulty;
    if (body.points !== undefined) updateData.points = body.points;
    if (body.deadline) updateData.deadline = new Date(body.deadline);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: updateData,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Auth check - admin only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { taskId } = await params;

    const existingTask = await db.task.findUnique({ where: { id: taskId } });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Soft delete - mark as inactive instead of deleting
    await db.task.update({
      where: { id: taskId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
