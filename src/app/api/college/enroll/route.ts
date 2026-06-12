import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'college') {
      return NextResponse.json({ error: 'Forbidden: College access required' }, { status: 403 });
    }

    const college = await db.college.findUnique({
      where: { userId: payload.userId },
    });
    if (!college) {
      return NextResponse.json({ error: 'College profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { students } = body as {
      students: {
        name: string;
        email: string;
        branch?: string;
        degree?: string;
        year?: string;
      }[];
    };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Students array is required' }, { status: 400 });
    }

    if (students.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 students can be enrolled at once' }, { status: 400 });
    }

    const results: { enrolled: string[]; errors: { index: number; email: string; error: string }[] } = {
      enrolled: [],
      errors: [],
    };

    // Default password for bulk enrolled students
    const defaultPasswordHash = await hashPassword('CampusCred@2025');

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student.name || !student.email) {
        results.errors.push({
          index: i,
          email: student.email || 'N/A',
          error: 'Name and email are required',
        });
        continue;
      }

      try {
        // Check if email already exists
        const existing = await db.user.findUnique({
          where: { email: student.email.trim().toLowerCase() },
        });

        if (existing) {
          results.errors.push({
            index: i,
            email: student.email,
            error: 'Email already registered',
          });
          continue;
        }

        // Create the student
        const user = await db.user.create({
          data: {
            fullName: student.name.trim(),
            email: student.email.trim().toLowerCase(),
            passwordHash: defaultPasswordHash,
            role: 'student',
            college: college.collegeName,
            branch: student.branch?.trim() || null,
            degree: student.degree?.trim() || null,
            year: student.year?.trim() || null,
            isVerified: false,
            campusCredScore: 0,
            level: 'Starter',
            points: 0,
          },
        });

        results.enrolled.push(user.id);
      } catch (err: any) {
        results.errors.push({
          index: i,
          email: student.email,
          error: err.message || 'Failed to create student',
        });
      }
    }

    return NextResponse.json({
      message: `Successfully enrolled ${results.enrolled.length} of ${students.length} students`,
      enrolledCount: results.enrolled.length,
      errorCount: results.errors.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json({ error: 'Failed to enroll students' }, { status: 500 });
  }
}
