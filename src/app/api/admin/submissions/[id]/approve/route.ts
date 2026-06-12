import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, generateCertificateId, getLevelFromPoints } from '@/lib/auth';
import { generateCertificate } from '@/lib/certificate/generate';
import { updateStudentScore } from '@/lib/score-service';

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

    if (submission.status === 'Approved') {
      return NextResponse.json({ error: 'Submission already approved' }, { status: 400 });
    }

    // Update submission status
    const updatedSubmission = await db.submission.update({
      where: { id },
      data: {
        status: 'Approved',
        reviewedBy: payload.userId,
        reviewedAt: new Date(),
      },
    });

    // Add points to student
    const newPoints = submission.student.points + submission.task.points;
    const newLevel = getLevelFromPoints(newPoints);

    await db.user.update({
      where: { id: submission.studentId },
      data: {
        points: newPoints,
        level: newLevel,
      },
    });

    // Parse skills
    let skills: string[] = [];
    try {
      skills = submission.student.skills ? JSON.parse(submission.student.skills) : [];
    } catch {
      skills = [];
    }

    // Generate premium certificate
    const certificateId = generateCertificateId();
    let certificateResult;
    
    try {
      certificateResult = await generateCertificate({
        certificateId,
        studentName: submission.student.fullName,
        degree: submission.student.degree || 'N/A',
        branch: submission.student.branch || 'N/A',
        college: submission.student.college || 'N/A',
        city: submission.student.city || '',
        state: '',
        taskTitle: submission.task.title,
        skills,
        level: newLevel,
        studentId: submission.student.id,
        profilePhotoUrl: submission.student.profilePhoto,
      });
    } catch (certError) {
      console.error('[Certificate Generation Error]', certError);
      // Fall back to creating a basic certificate record
      certificateResult = null;
    }

    // Create certificate record
    const certificate = await db.certificate.create({
      data: {
        certificateId,
        studentId: submission.studentId,
        taskId: submission.taskId,
        submissionId: submission.id,
        studentName: submission.student.fullName,
        degree: submission.student.degree || 'N/A',
        branch: submission.student.branch || 'N/A',
        taskTitle: submission.task.title,
        college: submission.student.college,
        city: submission.student.city,
        skills: JSON.stringify(skills),
        level: newLevel,
        qrCodeUrl: certificateResult?.pngUrl || null,
        pdfUrl: certificateResult?.pdfUrl || null,
        certificateImageUrl: certificateResult?.pngUrl || null,
        thumbnailUrl: certificateResult?.thumbnailUrl || null,
        hash: certificateResult?.hash || null,
        isValid: true,
      },
    });

    // Create notification for the student
    await db.notification.create({
      data: {
        userId: submission.studentId,
        message: `Your submission for "${submission.task.title}" has been approved! You earned ${submission.task.points} points and a premium certificate has been generated.`,
        type: 'success',
      },
    });

    // Recalculate CampusCred Score asynchronously
    try {
      await updateStudentScore(submission.studentId);
    } catch (scoreError) {
      console.error('[Score Update Error]', scoreError);
      // Non-blocking: don't fail the approval if score update fails
    }

    return NextResponse.json({
      message: 'Submission approved successfully',
      submission: updatedSubmission,
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        certificateImageUrl: certificate.certificateImageUrl,
        pdfUrl: certificate.pdfUrl,
        thumbnailUrl: certificate.thumbnailUrl,
      },
      studentUpdate: {
        newPoints,
        newLevel,
      },
    });
  } catch (error) {
    console.error('Error approving submission:', error);
    return NextResponse.json({ error: 'Failed to approve submission' }, { status: 500 });
  }
}
