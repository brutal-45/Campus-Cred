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

    // Student: get own ambassador data
    const stats = {
      referralCode: 'STUDENT2024XYZ',
      referralLink: 'https://campuscred.in/r/STUDENT2024XYZ',
      totalReferrals: 7,
      activeReferrals: 4,
      totalPoints: 140,
      currentBadge: 'Silver Ambassador',
      nextBadge: 'Gold Ambassador',
      nextBadgeRequirement: 10,
    };

    const activities = [
      { id: '1', name: 'Amit Kumar', date: '2024-06-08', status: 'rewarded', points: 20 },
      { id: '2', name: 'Sneha Das', date: '2024-06-07', status: 'active', points: 20 },
      { id: '3', name: 'Vikram Singh', date: '2024-06-05', status: 'registered', points: 0 },
      { id: '4', name: 'Priya Nair', date: '2024-06-03', status: 'rewarded', points: 20 },
      { id: '5', name: 'Karthik R', date: '2024-06-01', status: 'active', points: 20 },
      { id: '6', name: 'Deepa M', date: '2024-05-28', status: 'rewarded', points: 20 },
    ];

    const rewards = [
      { id: '1', name: 'Bronze Ambassador', description: 'Refer 3 students', required: 3, current: 3, unlocked: true },
      { id: '2', name: 'Silver Ambassador', description: 'Refer 5 students', required: 5, current: 5, unlocked: true },
      { id: '3', name: 'Gold Ambassador', description: 'Refer 10 students', required: 10, current: 7, unlocked: false },
      { id: '4', name: 'Platinum Ambassador', description: 'Refer 25 students', required: 25, current: 7, unlocked: false },
      { id: '5', name: 'Legend Ambassador', description: 'Refer 50 students', required: 50, current: 7, unlocked: false },
    ];

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
