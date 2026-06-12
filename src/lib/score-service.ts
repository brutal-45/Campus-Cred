import { db } from './db';
import { LEVEL_THRESHOLDS, SCORE_BREAKDOWN } from './constants';

/**
 * CampusCred Score Service
 * 
 * Calculates the CampusCred Score (0-1000) for a student based on:
 * - Tasks completed:         +50 points each
 * - Quality of submission:   +10 to +50 based on rating
 * - Certificates earned:     +30 points each
 * - Streak maintained:       +5 points per day
 * - Peer reviews given:      +10 points each
 * - Referrals:               +20 points each
 * - LinkedIn shares:         +5 points each
 * - Early submission bonus:  +15 points
 * 
 * Levels:
 * - 0   to 100  : Starter   🌱
 * - 101 to 300  : Achiever  ⚡
 * - 301 to 600  : Expert    🔥
 * - 601 to 900  : Elite     💎
 * - 901 to 1000 : Legend    👑
 */

export interface ScoreBreakdown {
  tasksCompleted: number;
  taskPoints: number;
  qualityBonus: number;
  certificatesEarned: number;
  certificatePoints: number;
  streakDays: number;
  streakPoints: number;
  peerReviewsGiven: number;
  peerReviewPoints: number;
  referrals: number;
  referralPoints: number;
  linkedinShares: number;
  linkedinPoints: number;
  earlySubmissions: number;
  earlySubmissionPoints: number;
  totalScore: number;
  level: string;
  levelIcon: string;
}

/**
 * Get the level for a given CampusCred Score
 */
export function getLevelForScore(score: number): { level: string; icon: string } {
  const clampedScore = Math.min(Math.max(score, 0), SCORE_BREAKDOWN.MAX_SCORE);
  
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (clampedScore >= LEVEL_THRESHOLDS[i].minScore) {
      return { level: LEVEL_THRESHOLDS[i].level, icon: LEVEL_THRESHOLDS[i].icon };
    }
  }
  
  return { level: 'Starter', icon: '🌱' };
}

/**
 * Calculate the full CampusCred Score breakdown for a student
 */
export async function calculateStudentScore(studentId: string): Promise<ScoreBreakdown> {
  // Get all approved submissions for this student
  const approvedSubmissions = await db.submission.findMany({
    where: {
      studentId,
      status: 'Approved',
    },
    include: {
      task: true,
    },
  });

  // Get all certificates for this student
  const certificates = await db.certificate.findMany({
    where: {
      studentId,
      isValid: true,
    },
  });

  // Get student data
  const student = await db.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Calculate task completion points
  const tasksCompleted = approvedSubmissions.length;
  const taskPoints = tasksCompleted * SCORE_BREAKDOWN.TASK_COMPLETED;

  // Calculate quality bonus based on ratings
  let qualityBonus = 0;
  for (const submission of approvedSubmissions) {
    if (submission.rating && submission.rating >= 1) {
      // Rating 1 = +10, Rating 2 = +20, Rating 3 = +30, Rating 4 = +40, Rating 5 = +50
      const ratingBonus = SCORE_BREAKDOWN.QUALITY_SUBMISSION_MIN + 
        ((submission.rating - 1) / 4) * (SCORE_BREAKDOWN.QUALITY_SUBMISSION_MAX - SCORE_BREAKDOWN.QUALITY_SUBMISSION_MIN);
      qualityBonus += Math.round(ratingBonus);
    }
  }

  // Certificate points
  const certificatesEarned = certificates.length;
  const certificatePoints = certificatesEarned * SCORE_BREAKDOWN.CERTIFICATE_EARNED;

  // Streak points
  const streakDays = student.streakDays;
  const streakPoints = streakDays * SCORE_BREAKDOWN.STREAK_PER_DAY;

  // Peer reviews given (submissions reviewed by this student)
  const peerReviewsGiven = await db.submission.count({
    where: {
      reviewedBy: studentId,
      status: { in: ['Approved', 'Rejected'] },
    },
  });
  const peerReviewPoints = peerReviewsGiven * SCORE_BREAKDOWN.PEER_REVIEW_GIVEN;

  // Referrals (users who were referred by this student)
  const referrals = await db.user.count({
    where: {
      referredBy: student.referralCode,
    },
  });
  const referralPoints = referrals * SCORE_BREAKDOWN.REFERRAL;

  // LinkedIn shares (from certificate share events - we'll estimate from certificates)
  // In production, this would come from a ShareEvent table. For now, estimate from certificates.
  const linkedinShares = Math.floor(certificatesEarned * 0.3); // Assume 30% of certs are shared
  const linkedinPoints = linkedinShares * SCORE_BREAKDOWN.LINKEDIN_SHARE;

  // Early submission bonus (submissions made within 24 hours of task creation)
  let earlySubmissions = 0;
  for (const submission of approvedSubmissions) {
    if (submission.task && submission.task.createdAt) {
      const hoursDiff = (submission.submittedAt.getTime() - submission.task.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff <= 24) {
        earlySubmissions++;
      }
    }
  }
  const earlySubmissionPoints = earlySubmissions * SCORE_BREAKDOWN.EARLY_SUBMISSION;

  // Calculate total score (capped at 1000)
  const rawScore = taskPoints + qualityBonus + certificatePoints + streakPoints + 
    peerReviewPoints + referralPoints + linkedinPoints + earlySubmissionPoints;
  const totalScore = Math.min(rawScore, SCORE_BREAKDOWN.MAX_SCORE);

  // Determine level
  const { level, icon: levelIcon } = getLevelForScore(totalScore);

  return {
    tasksCompleted,
    taskPoints,
    qualityBonus,
    certificatesEarned,
    certificatePoints,
    streakDays,
    streakPoints,
    peerReviewsGiven,
    peerReviewPoints,
    referrals,
    referralPoints,
    linkedinShares,
    linkedinPoints,
    earlySubmissions,
    earlySubmissionPoints,
    totalScore,
    level,
    levelIcon,
  };
}

/**
 * Recalculate and update a student's CampusCred Score in the database
 */
export async function updateStudentScore(studentId: string): Promise<ScoreBreakdown> {
  const breakdown = await calculateStudentScore(studentId);

  await db.user.update({
    where: { id: studentId },
    data: {
      campusCredScore: breakdown.totalScore,
      level: breakdown.level,
      points: breakdown.totalScore, // Keep legacy points in sync
    },
  });

  return breakdown;
}

/**
 * Get Hall of Fame - Top 10 students per branch
 */
export async function getHallOfFame(branch?: string): Promise<Array<{
  id: string;
  fullName: string;
  campusCredScore: number;
  level: string;
  branch: string;
  degree: string;
  college: string;
  profilePhoto: string | null;
  campusCredUsername: string | null;
}>> {
  const where: any = {
    role: 'student',
    isVerified: true,
    campusCredScore: { gt: 0 },
  };

  if (branch) {
    where.branch = branch;
  }

  const students = await db.user.findMany({
    where,
    orderBy: { campusCredScore: 'desc' },
    take: branch ? 10 : 50,
    select: {
      id: true,
      fullName: true,
      campusCredScore: true,
      level: true,
      branch: true,
      degree: true,
      college: true,
      profilePhoto: true,
      campusCredUsername: true,
    },
  });

  return students;
}
