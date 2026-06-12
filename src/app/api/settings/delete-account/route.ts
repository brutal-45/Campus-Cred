import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

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

    const body = await req.json();
    const { confirm } = body;

    if (confirm !== true) {
      return NextResponse.json(
        { error: 'You must confirm account deletion by setting confirm to true' },
        { status: 400 }
      );
    }

    const deletionRequestedAt = new Date();
    const deletionDate = new Date(deletionRequestedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await db.user.update({
      where: { id: payload.userId },
      data: { deletionRequestedAt },
    });

    return NextResponse.json({
      message: 'Account scheduled for deletion in 7 days',
      deletionDate,
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    await db.user.update({
      where: { id: payload.userId },
      data: { deletionRequestedAt: null },
    });

    return NextResponse.json({
      message: 'Account deletion cancelled',
    });
  } catch (error) {
    console.error('Cancel delete account error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
