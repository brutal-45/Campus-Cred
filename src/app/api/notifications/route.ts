import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

/**
 * /api/notifications
 * Notifications are created by approval/rejection/application flows but
 * previously had no read endpoint — students could never see them.
 */

function requireUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyAccessToken(authHeader.split(' ')[1]);
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { userId: payload.userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.notification.count({
        where: { userId: payload.userId, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/** PATCH { id } marks one read; PATCH { all: true } marks all read. */
export async function PATCH(req: NextRequest) {
  try {
    const payload = requireUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    if (body?.all) {
      await db.notification.updateMany({
        where: { userId: payload.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
    }

    const updated = await db.notification.updateMany({
      where: { id: body.id, userId: payload.userId },
      data: { isRead: true },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

/** DELETE { id } deletes one; DELETE { readOnly: true } clears read ones. */
export async function DELETE(req: NextRequest) {
  try {
    const payload = requireUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    if (body?.readOnly) {
      const deleted = await db.notification.deleteMany({
        where: { userId: payload.userId, isRead: true },
      });
      return NextResponse.json({ message: 'Read notifications cleared', count: deleted.count });
    }

    if (!body?.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
    }

    const deleted = await db.notification.deleteMany({
      where: { id: body.id, userId: payload.userId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
