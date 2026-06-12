/**
 * CampusCred — Certificate Generation API
 * POST /api/certificates/generate
 * 
 * Triggers certificate generation when admin approves a submission.
 * Can also be called directly for testing/re-generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, generateCertificateId, getLevelFromPoints } from '@/lib/auth';
import { generateCertificate } from '@/lib/certificate/generate';

export async function POST(req: NextRequest) {
  try {
    // Auth check - admin or system
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'system')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    // Fetch submission with student and task data
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        task: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status !== 'Approved') {
      return NextResponse.json({ error: 'Submission must be approved first' }, { status: 400 });
    }

    // Check if certificate already exists for this submission
    const existingCert = await db.certificate.findUnique({
      where: { submissionId: submission.id },
    });

    if (existingCert) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificate: {
          id: existingCert.id,
          certificateId: existingCert.certificateId,
          certificateImageUrl: existingCert.certificateImageUrl,
          pdfUrl: existingCert.pdfUrl,
          thumbnailUrl: existingCert.thumbnailUrl,
        },
      });
    }

    // Generate certificate ID
    const certificateId = generateCertificateId();
    const student = submission.student;
    const task = submission.task;
    const level = getLevelFromPoints(student.points);

    // Parse skills from JSON string
    let skills: string[] = [];
    try {
      skills = student.skills ? JSON.parse(student.skills) : [];
    } catch {
      skills = [];
    }

    // Generate the certificate
    const result = await generateCertificate({
      certificateId,
      studentName: student.fullName,
      degree: student.degree || 'N/A',
      branch: student.branch || 'N/A',
      college: student.college || 'N/A',
      city: student.city || '',
      state: '',
      taskTitle: task.title,
      skills,
      level,
      studentId: student.id,
      profilePhotoUrl: student.profilePhoto,
    });

    // Save certificate record to database
    const certificate = await db.certificate.create({
      data: {
        certificateId,
        studentId: student.id,
        taskId: task.id,
        submissionId: submission.id,
        studentName: student.fullName,
        degree: student.degree || 'N/A',
        branch: student.branch || 'N/A',
        taskTitle: task.title,
        college: student.college,
        city: student.city,
        skills: JSON.stringify(skills),
        level,
        qrCodeUrl: result.pngUrl,
        pdfUrl: result.pdfUrl,
        certificateImageUrl: result.pngUrl,
        thumbnailUrl: result.thumbnailUrl,
        hash: result.hash,
        isValid: true,
      },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: student.id,
        message: `Your certificate for "${task.title}" has been generated! Certificate ID: ${certificateId}. Download it from your dashboard.`,
        type: 'success',
      },
    });

    return NextResponse.json({
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        certificateImageUrl: certificate.certificateImageUrl,
        pdfUrl: certificate.pdfUrl,
        thumbnailUrl: certificate.thumbnailUrl,
        hash: certificate.hash,
      },
    });
  } catch (error) {
    console.error('[Certificate Generation Error]', error);
    return NextResponse.json(
      { error: 'Certificate generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
