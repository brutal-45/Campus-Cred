import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let userDegree: string | null = null;
    let userBranch: string | null = null;
    let userRole: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload) {
        userId = payload.userId;
        userRole = payload.role;
        const user = await db.user.findUnique({ where: { id: userId } });
        if (user) {
          userDegree = user.degree;
          userBranch = user.branch;
        }
      }
    }

    const { searchParams } = new URL(req.url);
    const degree = searchParams.get('degree') || userDegree;
    const branch = searchParams.get('branch') || userBranch;
    const includeAll = searchParams.get('all') === 'true';

    // Admin sees all tasks, students see only active ones
    const where: Record<string, unknown> = {};
    if (!(userRole === 'admin' && includeAll)) {
      where.isActive = true;
    }
    if (degree) where.degree = degree;
    if (branch) where.branch = branch;

    const tasks = await db.task.findMany({
      where,
      orderBy: { deadline: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        degree: true,
        branch: true,
        difficulty: true,
        points: true,
        deadline: true,
        taskKitUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { title, description, degree, branch, difficulty, points, deadline } = body;

    if (!title || !description || !degree || !branch || !deadline) {
      return NextResponse.json(
        { error: 'Title, description, degree, branch, and deadline are required' },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        degree,
        branch,
        difficulty: difficulty || 'Medium',
        points: points || 10,
        deadline: new Date(deadline),
        isActive: true,
        createdById: payload.userId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
