import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { getInitials } from '@/lib/certificate/avatar';

/**
 * /api/conversations
 * Real DB-backed direct/group messaging.
 * (Previously returned hardcoded demo chats and discarded sent messages.)
 */

function requireUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyAccessToken(authHeader.split(' ')[1]);
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

async function assertParticipant(conversationId: string, userId: string) {
  return db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
}

export async function GET(req: NextRequest) {
  try {
    const payload = requireUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    // ── Messages of one conversation ──
    if (conversationId) {
      const membership = await assertParticipant(conversationId, payload.userId);
      if (!membership) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const rows = await db.message.findMany({
        where: { conversationId },
        include: { sender: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
        take: 500,
      });

      // Mark as read for this participant.
      await db.conversationParticipant.update({
        where: { id: membership.id },
        data: { lastReadAt: new Date() },
      }).catch(() => {});

      const messages = rows.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.senderId === payload.userId ? 'You' : m.sender.fullName,
        content: m.content,
        time: m.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        createdAt: m.createdAt,
        read: m.isRead,
      }));

      return NextResponse.json({ messages });
    }

    // ── Conversation list ──
    const rows = await db.conversation.findMany({
      where: { participants: { some: { userId: payload.userId } } },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, profilePhoto: true } } },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const conversations = await Promise.all(rows.map(async (c) => {
      const others = c.participants.filter((p) => p.userId !== payload.userId);
      const mine = c.participants.find((p) => p.userId === payload.userId);
      const last = c.messages[0] || null;
      const unread = await db.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: payload.userId },
          ...(mine?.lastReadAt ? { createdAt: { gt: mine.lastReadAt } } : {}),
        },
      });

      const displayName = c.type === 'group'
        ? (c.name || others.map((p) => p.user.fullName).join(', '))
        : (others[0]?.user.fullName || 'Conversation');

      return {
        id: c.id,
        name: displayName,
        avatar: getInitials(displayName || 'C'),
        profilePhoto: c.type === 'direct' ? (others[0]?.user.profilePhoto || null) : null,
        lastMessage: last?.content || '',
        time: last ? relativeTime(last.createdAt) : relativeTime(c.updatedAt),
        unread,
        online: false,
        type: c.type,
        participants: c.participants.map((p) => ({
          id: p.user.id,
          fullName: p.user.fullName,
          profilePhoto: p.user.profilePhoto,
        })),
      };
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 * { conversationId, content } sends to an existing conversation.
 * { recipientId, content } finds/creates the direct conversation, then sends.
 * { recipientId } alone just creates/returns the conversation.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = requireUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let { conversationId } = body || {};
    const { recipientId, content } = body || {};

    if (!conversationId && recipientId) {
      if (recipientId === payload.userId) {
        return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
      }
      const recipient = await db.user.findUnique({ where: { id: recipientId }, select: { id: true } });
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      // Find an existing direct conversation with exactly these two people.
      const existing = await db.conversation.findFirst({
        where: {
          type: 'direct',
          participants: { every: { userId: { in: [payload.userId, recipientId] } } },
          AND: [
            { participants: { some: { userId: payload.userId } } },
            { participants: { some: { userId: recipientId } } },
          ],
        },
        include: { _count: { select: { participants: true } } },
      });

      if (existing && existing._count.participants === 2) {
        conversationId = existing.id;
      } else {
        const created = await db.conversation.create({
          data: {
            type: 'direct',
            participants: {
              create: [{ userId: payload.userId }, { userId: recipientId }],
            },
          },
        });
        conversationId = created.id;
      }
    }

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing required fields: conversationId or recipientId' }, { status: 400 });
    }

    const membership = await assertParticipant(conversationId, payload.userId);
    if (!membership) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!content || !String(content).trim()) {
      // Conversation resolved/created without a message.
      return NextResponse.json({ conversationId, success: true }, { status: 201 });
    }

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: payload.userId,
        content: String(content),
      },
      include: { sender: { select: { fullName: true } } },
    });

    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }).catch(() => {});

    return NextResponse.json({
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: 'You',
        content: message.content,
        time: message.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        createdAt: message.createdAt,
        read: false,
      },
      conversationId,
      success: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Conversation send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
