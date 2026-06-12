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

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const level = searchParams.get('level');
    const minScore = searchParams.get('minScore');
    const skills = searchParams.get('skills');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      role: 'student',
      isVerified: true,
    };

    if (branch) where.branch = branch;
    if (level) where.level = level;
    if (minScore) where.campusCredScore = { gte: parseInt(minScore) };
    if (skills) {
      where.skills = { contains: skills };
    }

    const students = await db.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        college: true,
        branch: true,
        degree: true,
        city: true,
        campusCredScore: true,
        level: true,
        skills: true,
        profilePhoto: true,
        campusCredUsername: true,
        streakDays: true,
        _count: {
          select: {
            submissions: true,
            certificates: true,
          },
        },
      },
      orderBy: { campusCredScore: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.user.count({ where });

    const formattedStudents = students.map((s) => ({
      id: s.id,
      name: s.fullName,
      email: s.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      college: s.college,
      branch: s.branch,
      degree: s.degree,
      city: s.city,
      score: s.campusCredScore,
      level: s.level,
      skills: s.skills ? JSON.parse(s.skills) : [],
      avatar: s.profilePhoto,
      username: s.campusCredUsername,
      streak: s.streakDays,
      tasksCompleted: s._count.submissions,
      certificates: s._count.certificates,
    }));

    return NextResponse.json({
      students: formattedStudents,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error searching talent:', error);
    return NextResponse.json({ error: 'Failed to search talent' }, { status: 500 });
  }
}
