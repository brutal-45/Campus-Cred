/**
 * CampusCred — Welcome Certificate Auto-Generation API
 * POST /api/certificates/welcome
 *
 * Automatically generates a welcome/registration certificate for a student
 * when they complete their onboarding. Called from the frontend after
 * profile setup is done.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, generateCertificateId, getLevelFromPoints } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Auth check - must be a student
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (payload.role !== 'student') {
      return NextResponse.json({ error: 'Only students can receive welcome certificates' }, { status: 403 });
    }

    // Check if student already has a welcome certificate
    const existingWelcome = await db.certificate.findFirst({
      where: {
        studentId: payload.userId,
        certType: 'welcome',
      },
    });

    if (existingWelcome) {
      return NextResponse.json({
        message: 'Welcome certificate already exists',
        certificate: {
          id: existingWelcome.id,
          certificateId: existingWelcome.certificateId,
          taskTitle: existingWelcome.taskTitle,
          studentName: existingWelcome.studentName,
          degree: existingWelcome.degree,
          branch: existingWelcome.branch,
          issuedDate: existingWelcome.issuedDate,
          level: existingWelcome.level,
        },
      });
    }

    // Fetch student data
    const student = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate certificate ID
    const certificateId = generateCertificateId();
    const level = getLevelFromPoints(student.points);

    // Parse skills
    let skills: string[] = [];
    try {
      skills = student.skills ? JSON.parse(student.skills) : [];
    } catch {
      skills = [];
    }

    // Generate hash for tamper-proofing
    const secret = process.env.CERT_SECRET || 'campuscred-cert-secret-2024';
    const issuedDate = new Date().toISOString();
    const hashData = `${certificateId}-${student.id}-welcome-${issuedDate}-${student.fullName}`;
    const hash = crypto.createHash('sha256').update(hashData + secret).digest('hex');

    // Create certificate record in database
    const certificate = await db.certificate.create({
      data: {
        certificateId,
        studentId: student.id,
        studentName: student.fullName,
        degree: student.degree || 'N/A',
        branch: student.branch || 'N/A',
        taskTitle: 'CampusCred Registration',
        college: student.college,
        city: student.city,
        state: student.state,
        skills: JSON.stringify(skills),
        level,
        hash,
        isValid: true,
        certType: 'welcome',
      },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: student.id,
        message: `Your welcome certificate has been generated! Certificate ID: ${certificateId}. Download it from your dashboard or profile page.`,
        type: 'success',
      },
    }).catch(() => {}); // Don't fail if notification creation fails

    return NextResponse.json({
      message: 'Welcome certificate generated successfully',
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        taskTitle: certificate.taskTitle,
        studentName: certificate.studentName,
        degree: certificate.degree,
        branch: certificate.branch,
        college: certificate.college,
        city: certificate.city,
        skills,
        level: certificate.level,
        issuedDate: certificate.issuedDate,
      },
    });
  } catch (error) {
    console.error('[Welcome Certificate Error]', error);
    return NextResponse.json(
      { error: 'Welcome certificate generation failed', details: String(error) },
      { status: 500 }
    );
  }
}
