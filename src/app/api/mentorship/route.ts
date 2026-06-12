import { NextResponse } from 'next/server';

// GET /api/mentorship - Get mentorship sessions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const mentors = [
      { id: 'm1', name: 'Priya Sharma', role: 'Senior Engineer', company: 'Google', avatar: 'PS', rating: 4.9, sessions: 156, expertise: ['System Design', 'DSA', 'Career Growth'], available: true },
      { id: 'm2', name: 'Rahul Verma', role: 'Product Manager', company: 'Razorpay', avatar: 'RV', rating: 4.8, sessions: 89, expertise: ['Product Thinking', 'Case Studies', 'Interviews'], available: true },
      { id: 'm3', name: 'Ananya Patel', role: 'UX Lead', company: 'Flipkart', avatar: 'AP', rating: 4.7, sessions: 67, expertise: ['UX Design', 'Portfolio Review', 'Design Thinking'], available: false },
      { id: 'm4', name: 'Arjun Reddy', role: 'Data Scientist', company: 'Amazon', avatar: 'AR', rating: 4.9, sessions: 120, expertise: ['ML', 'Python', 'Data Analysis'], available: true },
      { id: 'm5', name: 'Sneha Iyer', role: 'Tech Lead', company: 'Microsoft', avatar: 'SI', rating: 4.8, sessions: 200, expertise: ['Full Stack', 'React', 'Architecture'], available: true },
    ];

    const sessions = [
      { id: 's1', mentorId: 'm1', mentorName: 'Priya Sharma', topic: 'System Design for Scale', date: '2025-06-12', time: '10:00 AM', status: 'upcoming', notes: 'Prepare for distributed systems interview', type: 'video' },
      { id: 's2', mentorId: 'm5', mentorName: 'Sneha Iyer', topic: 'React Architecture Review', date: '2025-06-14', time: '3:00 PM', status: 'upcoming', notes: 'Review portfolio project architecture', type: 'video' },
      { id: 's3', mentorId: 'm2', mentorName: 'Rahul Verma', topic: 'PM Interview Prep', date: '2025-06-05', time: '11:00 AM', status: 'completed', notes: 'Great session on case study frameworks', rating: 5, type: 'video' },
      { id: 's4', mentorId: 'm4', mentorName: 'Arjun Reddy', topic: 'ML Basics', date: '2025-06-01', time: '2:00 PM', status: 'completed', notes: 'Covered supervised learning basics', rating: 4, type: 'video' },
      { id: 's5', mentorId: 'm3', mentorName: 'Ananya Patel', topic: 'UX Portfolio Review', date: '2025-05-28', time: '4:00 PM', status: 'cancelled', notes: 'Had to reschedule', type: 'video' },
    ];

    const filteredSessions = status === 'all' ? sessions : sessions.filter(s => s.status === status);

    return NextResponse.json({
      mentors,
      sessions: filteredSessions,
      stats: {
        upcoming: sessions.filter(s => s.status === 'upcoming').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        avgRating: 4.8,
        availableMentors: mentors.filter(m => m.available).length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mentorship data' }, { status: 500 });
  }
}

// POST /api/mentorship - Book a new mentorship session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mentorId, topic, date, time, notes } = body;

    if (!mentorId || !topic || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields: mentorId, topic, date, time' }, { status: 400 });
    }

    const newSession = {
      id: `s${Date.now()}`,
      mentorId,
      mentorName: 'Mentor',
      topic,
      date,
      time,
      status: 'upcoming',
      notes: notes || '',
      type: 'video',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      session: newSession,
      message: 'Session booked successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book session' }, { status: 500 });
  }
}
