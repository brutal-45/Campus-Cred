import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificateHash } from '@/lib/certificate/generate';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params;

    // Dynamic import to avoid build issues
    const { db } = await import('@/lib/db');

    const certificate = await db.certificate.findUnique({
      where: { certificateId },
      include: {
        student: {
          select: {
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
            title: true,
            difficulty: true,
            points: true,
            category: true,
          },
        },
      },
    });

    if (!certificate || !certificate.isValid) {
      return NextResponse.json({
        valid: false,
        message: 'This certificate ID does not exist in our records',
      });
    }

    // Parse skills
    let skills: string[] = [];
    try {
      skills = certificate.skills ? JSON.parse(certificate.skills) : [];
    } catch {
      skills = [];
    }

    // Verify hash if available
    let hashValid = null;
    if (certificate.hash) {
      try {
        hashValid = verifyCertificateHash(
          certificate.certificateId,
          certificate.studentId,
          certificate.taskId,
          certificate.issuedDate.toISOString(),
          certificate.studentName,
          certificate.hash
        );
      } catch {
        hashValid = false;
      }
    }

    return NextResponse.json({
      valid: true,
      studentName: certificate.studentName,
      taskTitle: certificate.taskTitle,
      degree: certificate.degree,
      branch: certificate.branch,
      college: certificate.student.college,
      city: certificate.student.city,
      level: certificate.level,
      skills,
      issuedDate: certificate.issuedDate,
      certificateId: certificate.certificateId,
      certificateImageUrl: certificate.certificateImageUrl,
      thumbnailUrl: certificate.thumbnailUrl,
      taskDifficulty: certificate.task.difficulty,
      taskCategory: certificate.task.category,
      hashValid,
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
