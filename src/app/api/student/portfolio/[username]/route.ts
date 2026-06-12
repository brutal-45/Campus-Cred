import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateStudentScore, getLevelForScore } from '@/lib/score-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Find student by campusCredUsername
    const student = await db.user.findUnique({
      where: { campusCredUsername: username },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        degree: true,
        branch: true,
        college: true,
        city: true,
        bio: true,
        profilePhoto: true,
        skills: true,
        socialLinks: true,
        campusCredScore: true,
        level: true,
        streakDays: true,
        campusCredUsername: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!student || !student.isVerified) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get certificates
    const certificates = await db.certificate.findMany({
      where: {
        studentId: student.id,
        isValid: true,
      },
      select: {
        certificateId: true,
        taskTitle: true,
        level: true,
        issuedDate: true,
        skills: true,
        thumbnailUrl: true,
        qrCodeUrl: true,
      },
      orderBy: { issuedDate: 'desc' },
    });

    // Get completed tasks (approved submissions)
    const completedTasks = await db.submission.findMany({
      where: {
        studentId: student.id,
        status: 'Approved',
      },
      include: {
        task: {
          select: {
            title: true,
            category: true,
            difficulty: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    });

    // Get internship history
    const internships = await db.internshipApplicant.findMany({
      where: {
        studentId: student.id,
        status: { in: ['Shortlisted', 'Hired'] },
      },
      include: {
        internship: {
          include: {
            company: {
              select: {
                companyName: true,
                logoUrl: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Calculate score breakdown
    let scoreBreakdown = null;
    try {
      const breakdown = await calculateStudentScore(student.id);
      scoreBreakdown = {
        totalScore: breakdown.totalScore,
        level: breakdown.level,
        levelIcon: breakdown.levelIcon,
        tasksCompleted: breakdown.tasksCompleted,
        certificatesEarned: breakdown.certificatesEarned,
        streakDays: breakdown.streakDays,
        peerReviewsGiven: breakdown.peerReviewsGiven,
      };
    } catch {
      // Fallback to stored values
      const levelInfo = getLevelForScore(student.campusCredScore);
      scoreBreakdown = {
        totalScore: student.campusCredScore,
        level: student.level || levelInfo.level,
        levelIcon: levelInfo.icon,
        tasksCompleted: 0,
        certificatesEarned: certificates.length,
        streakDays: student.streakDays,
        peerReviewsGiven: 0,
      };
    }

    // Parse skills and social links
    let skills: string[] = [];
    try {
      skills = student.skills ? JSON.parse(student.skills) : [];
    } catch { skills = []; }

    let socialLinks: Record<string, string> = {};
    try {
      socialLinks = student.socialLinks ? JSON.parse(student.socialLinks) : {};
    } catch { socialLinks = {}; }

    // Mask sensitive data
    const maskedEmail = student.email
      ? student.email.replace(/^(.{1,2})(.*)(@.*)$/, (_, a, b, c) => a + '***' + c)
      : null;
    const maskedPhone = student.phone
      ? student.phone.replace(/(\d{2})\d*(\d{2})$/, '$1****$2')
      : null;

    return NextResponse.json({
      student: {
        id: student.id,
        fullName: student.fullName,
        email: maskedEmail,
        phone: maskedPhone,
        degree: student.degree,
        branch: student.branch,
        college: student.college,
        city: student.city,
        bio: student.bio,
        profilePhoto: student.profilePhoto,
        skills,
        socialLinks,
        campusCredUsername: student.campusCredUsername,
        isVerified: student.isVerified,
        memberSince: student.createdAt,
      },
      score: scoreBreakdown,
      certificates: certificates.map((cert) => ({
        certificateId: cert.certificateId,
        taskTitle: cert.taskTitle,
        level: cert.level,
        issuedDate: cert.issuedDate,
        skills: cert.skills ? JSON.parse(cert.skills) : [],
        thumbnailUrl: cert.thumbnailUrl,
        qrCodeUrl: cert.qrCodeUrl,
      })),
      completedTasks: completedTasks.map((sub) => ({
        id: sub.id,
        taskTitle: sub.task.title,
        category: sub.task.category,
        difficulty: sub.task.difficulty,
        rating: sub.rating,
        submittedAt: sub.submittedAt,
        feedback: sub.feedback,
      })),
      internships: internships.map((app) => ({
        title: app.internship.title,
        company: app.internship.company.companyName,
        companyLogo: app.internship.company.logoUrl,
        industry: app.internship.company.industry,
        status: app.status,
        duration: app.internship.duration,
        stipend: app.internship.stipend,
      })),
    });
  } catch (error: any) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch portfolio' }, { status: 500 });
  }
}
