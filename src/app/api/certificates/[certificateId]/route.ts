import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
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

    const { certificateId } = await params;

    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            degree: true,
            branch: true,
            college: true,
            city: true,
            profilePhoto: true,
            level: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            degree: true,
            branch: true,
            difficulty: true,
            points: true,
            category: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    // Allow access if user owns the certificate or is admin
    if (certificate.studentId !== payload.userId && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'You do not have access to this certificate' },
        { status: 403 }
      );
    }

    // Parse skills
    let skills: string[] = [];
    try {
      skills = certificate.skills ? JSON.parse(certificate.skills) : [];
    } catch {
      skills = [];
    }

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        degree: certificate.degree,
        branch: certificate.branch,
        taskTitle: certificate.taskTitle,
        college: certificate.college,
        city: certificate.city,
        skills,
        level: certificate.level,
        issuedDate: certificate.issuedDate,
        qrCodeUrl: certificate.qrCodeUrl,
        pdfUrl: certificate.pdfUrl,
        certificateImageUrl: certificate.certificateImageUrl,
        thumbnailUrl: certificate.thumbnailUrl,
        hash: certificate.hash,
        isValid: certificate.isValid,
        student: certificate.student,
        task: certificate.task,
      },
    });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate' },
      { status: 500 }
    );
  }
}
