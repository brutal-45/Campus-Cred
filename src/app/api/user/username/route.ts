import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

function generateUsername(fullName: string, branch: string | null): string {
  const firstName = fullName
    .split(' ')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const branchPart = branch
    ? branch.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6)
    : 'gen';
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${firstName}.${branchPart}.${randomDigits}`;
}

export async function POST(req: NextRequest) {
  try {
    // Require Bearer token auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, fullName: true, branch: true, campusCredUsername: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user already has a username, return it
    if (user.campusCredUsername) {
      return NextResponse.json({
        username: user.campusCredUsername,
      });
    }

    // Generate a unique username
    let username = generateUsername(user.fullName, user.branch);
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await db.user.findUnique({
        where: { campusCredUsername: username },
      });

      if (!existing) {
        break;
      }

      attempts++;
      username = generateUsername(user.fullName, user.branch);
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Could not generate a unique username. Please try again.' },
        { status: 500 }
      );
    }

    // Update user's campusCredUsername
    await db.user.update({
      where: { id: user.id },
      data: { campusCredUsername: username },
    });

    return NextResponse.json({
      username,
    });
  } catch (error) {
    console.error('Generate username error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
