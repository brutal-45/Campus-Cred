import { NextRequest, NextResponse } from 'next/server';
import { calculateStudentScore, updateStudentScore } from '@/lib/score-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const breakdown = await calculateStudentScore(studentId);

    return NextResponse.json({
      score: breakdown.totalScore,
      level: breakdown.level,
      levelIcon: breakdown.levelIcon,
      breakdown: {
        tasksCompleted: breakdown.tasksCompleted,
        taskPoints: breakdown.taskPoints,
        qualityBonus: breakdown.qualityBonus,
        certificatesEarned: breakdown.certificatesEarned,
        certificatePoints: breakdown.certificatePoints,
        streakDays: breakdown.streakDays,
        streakPoints: breakdown.streakPoints,
        peerReviewsGiven: breakdown.peerReviewsGiven,
        peerReviewPoints: breakdown.peerReviewPoints,
        referrals: breakdown.referrals,
        referralPoints: breakdown.referralPoints,
        linkedinShares: breakdown.linkedinShares,
        linkedinPoints: breakdown.linkedinPoints,
        earlySubmissions: breakdown.earlySubmissions,
        earlySubmissionPoints: breakdown.earlySubmissionPoints,
      },
    });
  } catch (error: any) {
    console.error('Score calculation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to calculate score' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const breakdown = await updateStudentScore(studentId);

    return NextResponse.json({
      score: breakdown.totalScore,
      level: breakdown.level,
      levelIcon: breakdown.levelIcon,
      breakdown: {
        tasksCompleted: breakdown.tasksCompleted,
        taskPoints: breakdown.taskPoints,
        qualityBonus: breakdown.qualityBonus,
        certificatesEarned: breakdown.certificatesEarned,
        certificatePoints: breakdown.certificatePoints,
        streakDays: breakdown.streakDays,
        streakPoints: breakdown.streakPoints,
        peerReviewsGiven: breakdown.peerReviewsGiven,
        peerReviewPoints: breakdown.peerReviewPoints,
        referrals: breakdown.referrals,
        referralPoints: breakdown.referralPoints,
        linkedinShares: breakdown.linkedinShares,
        linkedinPoints: breakdown.linkedinPoints,
        earlySubmissions: breakdown.earlySubmissions,
        earlySubmissionPoints: breakdown.earlySubmissionPoints,
      },
    });
  } catch (error: any) {
    console.error('Score update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update score' }, { status: 500 });
  }
}
