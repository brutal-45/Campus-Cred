import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Count real students (verified users with student role)
    const studentCount = await db.user.count({
      where: {
        role: 'student',
        isVerified: true,
      },
    });

    // Count real certificates issued
    const certificateCount = await db.certificate.count();

    // Count companies
    const companyCount = await db.user.count({
      where: {
        role: 'company',
        isVerified: true,
      },
    });

    // Count unique branches
    const branchResult = await db.user.findMany({
      where: {
        role: 'student',
        isVerified: true,
        branch: { not: null },
      },
      select: { branch: true },
      distinct: ['branch'],
    });
    const branchCount = branchResult.length;

    return NextResponse.json({
      students: studentCount,
      certificates: certificateCount,
      companies: companyCount,
      branches: branchCount,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { students: 0, certificates: 0, companies: 0, branches: 0 },
      { status: 500 }
    );
  }
}
