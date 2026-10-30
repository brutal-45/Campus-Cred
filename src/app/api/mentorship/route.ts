import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { getInitials } from '@/lib/certificate/avatar';

/**
 * /api/mentorship
 * Real DB-backed mentors + mentorship sessions.
 * (Previously returned hardcoded demo mentors and "booked" sessions
 * that were never persisted.)
 */

function optionalUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return verifyAccessToken(authHeader.split(' ')[1]);
}

function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [value];
  }
}

function mapStatus(status: string): string {
  switch (status) {
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'upcoming'; // Scheduled / In Progress
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const payload = optionalUser(req);

    const mentorRows = await db.mentor.findMany({
      include: {
        user: { select: { id: true, fullName: true, profilePhoto: true } },
        _count: { select: { sessions: true } },
      },
      orderBy: { rating: 'desc' },
      take: 50,
    });

    const mentors = mentorRows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.fullName,
      role: m.designation || 'Mentor',
      company: m.organization || '',
      avatar: getInitials(m.user.fullName),
      profilePhoto: m.user.profilePhoto,
      rating: m.rating,
      reviews: m.totalReviews,
      sessions: m._count.sessions,
      expertise: parseStringArray(m.expertise),
      experience: m.experience,
      hourlyRate: m.hourlyRate,
      available: m.isAvailable,
    }));

    // Sessions are personal — only return them for the signed-in user
    // (as student, or as mentor when the caller is a mentor).
    let sessions: Array<Record<string, unknown>> = [];
    if (payload) {
      const sessionRows = await db.mentorshipSession.findMany({
        where:
          payload.role === 'mentor'
            ? { mentor: { userId: payload.userId } }
            : { studentId: payload.userId },
        include: {
          mentor: { include: { user: { select: { fullName: true } } } },
          student: { select: { fullName: true } },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 100,
      });

      sessions = sessionRows.map((s) => ({
        id: s.id,
        mentorId: s.mentorId,
        mentorName: s.mentor.user.fullName,
        studentName: s.student.fullName,
        topic: s.topic,
        date: s.scheduledAt.toISOString().split('T')[0],
        time: s.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        scheduledAt: s.scheduledAt,
        status: mapStatus(s.status),
        rawStatus: s.status,
        notes: s.notes || '',
        rating: s.rating,
        meetLink: s.meetLink,
        type: 'video',
      }));
    }

    const filteredSessions = status === 'all' ? sessions : sessions.filter((s) => s.status === status);
    const rated = sessions.filter((s) => typeof s.rating === 'number') as Array<{ rating: number }>;

    return NextResponse.json({
      mentors,
      sessions: filteredSessions,
      stats: {
        upcoming: sessions.filter((s) => s.status === 'upcoming').length,
        completed: sessions.filter((s) => s.status === 'completed').length,
        avgRating: rated.length ? Math.round((rated.reduce((a, s) => a + s.rating, 0) / rated.length) * 10) / 10 : 0,
        availableMentors: mentors.filter((m) => m.available).length,
      },
    });
  } catch (error) {
    console.error('Mentorship fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch mentorship data' }, { status: 500 });
  }
}

/** POST /api/mentorship — a student books a session with a mentor. */
export async function POST(req: NextRequest) {
  try {
    const payload = optionalUser(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (payload.role !== 'student') {
      return NextResponse.json({ error: 'Only students can book mentorship sessions' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { mentorId, topic, date, time, notes, duration } = body || {};

    if (!mentorId || !topic || !date) {
      return NextResponse.json({ error: 'Missing required fields: mentorId, topic, date' }, { status: 400 });
    }

    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      include: { user: { select: { fullName: true } } },
    });
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }
    if (!mentor.isAvailable) {
      return NextResponse.json({ error: 'This mentor is not currently available' }, { status: 400 });
    }

    // Accept a full ISO datetime in `date`, or date + time parts.
    const scheduledAt = time && !String(date).includes('T')
      ? new Date(`${date}T${time}`)
      : new Date(date);
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time for the session' }, { status: 400 });
    }

    const session = await db.mentorshipSession.create({
      data: {
        studentId: payload.userId,
        mentorId: mentor.id,
        topic,
        scheduledAt,
        duration: typeof duration === 'number' ? duration : null,
        notes: notes || null,
        status: 'Scheduled',
      },
    });

    await db.notification.create({
      data: {
        userId: mentor.userId,
        message: `New mentorship session booked: "${topic}" on ${scheduledAt.toLocaleString('en-IN')}`,
        type: 'info',
      },
    }).catch(() => {});

    return NextResponse.json({
      session: {
        id: session.id,
        mentorId: session.mentorId,
        mentorName: mentor.user.fullName,
        topic: session.topic,
        date: session.scheduledAt.toISOString().split('T')[0],
        time: session.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        scheduledAt: session.scheduledAt,
        status: 'upcoming',
        rawStatus: session.status,
        notes: session.notes || '',
        type: 'video',
        createdAt: session.createdAt,
      },
      message: 'Session booked successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Mentorship booking error:', error);
    return NextResponse.json({ error: 'Failed to book session' }, { status: 500 });
  }
}
