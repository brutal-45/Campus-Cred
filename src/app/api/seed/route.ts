import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getLevelFromPoints } from '@/lib/auth';

export async function GET() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'creatorsports81@gmail.com' },
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Database already seeded. Admin account exists.',
        userCount: await db.user.count(),
      });
    }

    // Create ONLY the admin user — locked to creatorsports81@gmail.com
    const adminHash = await hashPassword('Viraj@133');
    await db.user.create({
      data: {
        fullName: 'Admin CampusCred',
        email: 'creatorsports81@gmail.com',
        passwordHash: adminHash,
        role: 'admin',
        isVerified: true,
        points: 0,
        level: 'Starter',
      },
    });

    const totalUsers = await db.user.count();

    return NextResponse.json({
      message: 'Database seeded successfully! Admin account created.',
      summary: {
        users: totalUsers,
      },
      adminAccount: {
        email: 'creatorsports81@gmail.com',
        note: 'This is the ONLY admin account. No other admin logins are allowed.',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
