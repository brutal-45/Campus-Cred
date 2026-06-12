import { NextResponse } from 'next/server';

// GET /api/daily-challenges - Get active daily challenges
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const challenges = [
      {
        id: `dc-${today}-1`,
        title: 'Build a Responsive Navbar',
        description: 'Create a fully responsive navigation bar with mobile hamburger menu, dropdown, and smooth animations using React and Tailwind CSS.',
        category: 'Development',
        difficulty: 'Easy',
        points: 50,
        xpReward: 30,
        timeLimit: 1800,
        completedBy: 23,
        totalParticipants: 156,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: `dc-${today}-2`,
        title: 'API Error Handling',
        description: 'Implement comprehensive error handling for a REST API including 404, 500, rate limiting, and proper error response format.',
        category: 'Development',
        difficulty: 'Medium',
        points: 80,
        xpReward: 50,
        timeLimit: 3600,
        completedBy: 8,
        totalParticipants: 67,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: `dc-${today}-3`,
        title: 'Design a Landing Page',
        description: 'Create a visually stunning landing page with hero section, features grid, testimonials, and CTA. Focus on typography and spacing.',
        category: 'Design',
        difficulty: 'Medium',
        points: 70,
        xpReward: 45,
        timeLimit: 2700,
        completedBy: 12,
        totalParticipants: 89,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: `dc-${today}-4`,
        title: 'Write Technical Blog Post',
        description: 'Write a 500-word technical blog post explaining a complex concept in simple terms. Include code examples and diagrams.',
        category: 'Writing',
        difficulty: 'Easy',
        points: 40,
        xpReward: 25,
        timeLimit: 2400,
        completedBy: 34,
        totalParticipants: 112,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: `dc-${today}-5`,
        title: 'Database Schema Design',
        description: 'Design a normalized database schema for an e-commerce platform with users, products, orders, and reviews tables.',
        category: 'Data',
        difficulty: 'Hard',
        points: 100,
        xpReward: 70,
        timeLimit: 5400,
        completedBy: 3,
        totalParticipants: 28,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    return NextResponse.json({
      challenges,
      meta: {
        date: today,
        totalChallenges: challenges.length,
        refreshAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
