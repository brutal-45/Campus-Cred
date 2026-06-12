import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { logFraudEvent, resolveFraudEvent } from '@/lib/security';

// GET /api/fraud - Get fraud logs with filters
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity') || undefined;
    const type = searchParams.get('type') || undefined;
    const resolved = searchParams.get('resolved');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (resolved !== null && resolved !== undefined) {
      where.resolved = resolved === 'true';
    }

    const [logs, total] = await Promise.all([
      db.fraudLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.fraudLog.count({ where }),
    ]);

    // Stats
    const [totalAlerts, unresolved, criticalCount, highCount] = await Promise.all([
      db.fraudLog.count(),
      db.fraudLog.count({ where: { resolved: false } }),
      db.fraudLog.count({ where: { severity: 'critical', resolved: false } }),
      db.fraudLog.count({ where: { severity: 'high', resolved: false } }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: { totalAlerts, unresolved, criticalCount, highCount },
    });
  } catch (error) {
    console.error('Error fetching fraud logs:', error);
    return NextResponse.json({ error: 'Failed to fetch fraud logs' }, { status: 500 });
  }
}

// POST /api/fraud - Create new fraud alert
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, type, severity, description, metadata, ipAddress } = body;

    if (!type || !severity || !description) {
      return NextResponse.json({ error: 'Missing required fields: type, severity, description' }, { status: 400 });
    }

    await logFraudEvent({
      userId: userId || undefined,
      type,
      severity,
      description,
      metadata: metadata || undefined,
      ipAddress: ipAddress || undefined,
    });

    return NextResponse.json({ success: true, message: 'Fraud alert created' });
  } catch (error) {
    console.error('Error creating fraud alert:', error);
    return NextResponse.json({ error: 'Failed to create fraud alert' }, { status: 500 });
  }
}

// PUT /api/fraud - Resolve a fraud alert
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing fraud log ID' }, { status: 400 });
    }

    await resolveFraudEvent(id, payload.userId);

    return NextResponse.json({ success: true, message: 'Fraud alert resolved' });
  } catch (error) {
    console.error('Error resolving fraud alert:', error);
    return NextResponse.json({ error: 'Failed to resolve fraud alert' }, { status: 500 });
  }
}
