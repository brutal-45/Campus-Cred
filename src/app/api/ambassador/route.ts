import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

// GET /api/ambassador - Get ambassador stats and referral data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Admin: list all ambassadors
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload && payload.role === 'admin' && action === 'list') {
        const ambassadors = await db.user.findMany({
          where: { isAmbassador: true },
          select: {
            id: true, fullName: true, email: true, college: true,
            isAmbassador: true, ambassadorLevel: true, referralCode: true,
            campusCredScore: true, createdAt: true,
            ambassadorActivities: { orderBy: { createdAt: 'desc' }, take: 10 },
            referralsMade: { select: { id: true, status: true, referredEmail: true, createdAt: true } },
          },
          orderBy: { campusCredScore: 'desc' },
        });

        return NextResponse.json({ ambassadors });
      }
    }

    // Student: get own ambassador data (real referral data — this used to be
    // hardcoded demo numbers identical for every user).
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyAccessToken(authHeader.split(' ')[1]);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, fullName: true, referralCode: true, isAmbassador: true, ambassadorLevel: true,
        referralsMade: { orderBy: { createdAt: 'desc' }, take: 50 },
        ambassadorActivities: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure the student has a stable referral code.
    let referralCode = user.referralCode;
    if (!referralCode) {
      const base = user.fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6) || 'CAMPUS';
      for (let attempt = 0; attempt < 5 && !referralCode; attempt++) {
        const candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        const taken = await db.user.findUnique({ where: { referralCode: candidate }, select: { id: true } });
        if (!taken) referralCode = candidate;
      }
      referralCode = referralCode || `CC${user.id.slice(-8).toUpperCase()}`;
      await db.user.update({ where: { id: user.id }, data: { referralCode } });
    }

    const referrals = user.referralsMade;
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter((r) => r.status === 'Registered' || r.status === 'Completed').length;
    const completedReferrals = referrals.filter((r) => r.status === 'Completed').length;
    const activityPoints = user.ambassadorActivities.reduce((sum, a) => sum + a.points, 0);
    const totalPoints = activityPoints + completedReferrals * 20;

    const TIERS = [
      { name: 'Bronze Ambassador', required: 3 },
      { name: 'Silver Ambassador', required: 5 },
      { name: 'Gold Ambassador', required: 10 },
      { name: 'Platinum Ambassador', required: 25 },
      { name: 'Legend Ambassador', required: 50 },
    ];
    const unlockedTiers = TIERS.filter((t) => totalReferrals >= t.required);
    const nextTier = TIERS.find((t) => totalReferrals < t.required) || null;

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://campuscred.in').replace(/\/+$/, '');
    const stats = {
      referralCode,
      referralLink: `${appUrl}/register?ref=${referralCode}`,
      totalReferrals,
      activeReferrals,
      totalPoints,
      isAmbassador: user.isAmbassador,
      currentBadge: unlockedTiers.length ? unlockedTiers[unlockedTiers.length - 1].name : 'Campus Ambassador',
      nextBadge: nextTier?.name || null,
      nextBadgeRequirement: nextTier?.required || null,
    };

    const activities = referrals.map((r) => ({
      id: r.id,
      name: r.referredEmail,
      date: r.createdAt.toISOString().split('T')[0],
      status: r.status === 'Completed' ? 'rewarded' : r.status === 'Registered' ? 'active' : 'registered',
      points: r.status === 'Completed' ? 20 : 0,
    }));

    const rewards = TIERS.map((t, i) => ({
      id: String(i + 1),
      name: t.name,
      description: `Refer ${t.required} students`,
      required: t.required,
      current: Math.min(totalReferrals, t.required),
      unlocked: totalReferrals >= t.required,
    }));

    return NextResponse.json({ stats, activities, rewards });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ambassador data' }, { status: 500 });
  }
}

// POST /api/ambassador - Track a new referral activity OR approve/reject ambassador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Admin: approve ambassador
    if (action === 'approve') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

      await db.user.update({
        where: { id: userId },
        data: { isAmbassador: true, ambassadorLevel: 'bronze' },
      });

      return NextResponse.json({ success: true, message: 'Ambassador approved' });
    }

    // Admin: reject ambassador
    if (action === 'reject') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { userId } = body;
      if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

      await db.user.update({
        where: { id: userId },
        data: { isAmbassador: false, ambassadorLevel: null },
      });

      return NextResponse.json({ success: true, message: 'Ambassador rejected' });
    }

    // Admin: approve activity
    if (action === 'approve-activity') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (!payload || payload.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { activityId, points } = body;
      if (!activityId) return NextResponse.json({ error: 'Missing activityId' }, { status: 400 });

      await db.ambassadorActivity.update({
        where: { id: activityId },
        data: { points: points || 0 },
      });

      return NextResponse.json({ success: true, message: 'Activity approved' });
    }

    if (action === 'generate-link') {
      return NextResponse.json({
        referralLink: `https://campuscred.in/r/STUDENT2024XYZ`,
        message: 'Referral link generated',
      });
    }

    if (action === 'claim-reward') {
      const { rewardId } = body;
      if (!rewardId) return NextResponse.json({ error: 'Missing rewardId' }, { status: 400 });
      return NextResponse.json({ success: true, message: 'Reward claimed successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process ambassador action' }, { status: 500 });
  }
}
