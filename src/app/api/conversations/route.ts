import { NextResponse } from 'next/server';

// GET /api/conversations - Get conversations list
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    const conversations = [
      { id: '1', name: 'Priya Sharma', avatar: 'PS', lastMessage: 'Great work on the latest submission! Keep it up 🎉', time: '2m ago', unread: 2, online: true, type: 'direct' },
      { id: '2', name: 'CSE Batch 2025', avatar: 'CSE', lastMessage: 'Anyone working on the API challenge?', time: '15m ago', unread: 5, online: false, type: 'group' },
      { id: '3', name: 'Rahul Verma', avatar: 'RV', lastMessage: 'Can we schedule a mock interview?', time: '1h ago', unread: 1, online: true, type: 'direct' },
      { id: '4', name: 'CampusCred Support', avatar: 'CC', lastMessage: 'Your certificate is ready for download', time: '3h ago', unread: 0, online: true, type: 'direct' },
      { id: '5', name: 'Design Team', avatar: 'DT', lastMessage: 'Check the new Figma updates', time: '5h ago', unread: 0, online: false, type: 'group' },
      { id: '6', name: 'Arjun Reddy', avatar: 'AR', lastMessage: 'Thanks for the ML resources!', time: '1d ago', unread: 0, online: false, type: 'direct' },
    ];

    const messagesByConversation: Record<string, Array<{
      id: string; conversationId: string; senderId: string; senderName: string; content: string; time: string; read: boolean;
    }>> = {
      '1': [
        { id: '1', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'Hi! I reviewed your latest submission.', time: '10:00 AM', read: true },
        { id: '2', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'The code quality has improved significantly since last time.', time: '10:01 AM', read: true },
        { id: '3', conversationId: '1', senderId: 'me', senderName: 'You', content: 'Thank you! I spent extra time on the edge cases.', time: '10:05 AM', read: true },
        { id: '4', conversationId: '1', senderId: 'mentor', senderName: 'Priya Sharma', content: 'Great work on the latest submission! Keep it up 🎉', time: '10:20 AM', read: false },
      ],
      '2': [
        { id: '1', conversationId: '2', senderId: 'other', senderName: 'Amit Kumar', content: 'Has anyone started the React challenge?', time: '9:00 AM', read: true },
        { id: '2', conversationId: '2', senderId: 'other2', senderName: 'Sneha Das', content: 'I just completed it! The state management part was tricky.', time: '9:15 AM', read: true },
        { id: '3', conversationId: '2', senderId: 'me', senderName: 'You', content: 'I\'m planning to start tonight. Any tips?', time: '9:30 AM', read: true },
        { id: '4', conversationId: '2', senderId: 'other', senderName: 'Amit Kumar', content: 'Anyone working on the API challenge?', time: '9:45 AM', read: false },
      ],
    };

    if (conversationId) {
      const messages = messagesByConversation[conversationId] || [];
      return NextResponse.json({ messages });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

// POST /api/conversations - Send a new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Missing required fields: conversationId, content' }, { status: 400 });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'me',
      senderName: 'You',
      content,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: newMessage,
      success: true,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
