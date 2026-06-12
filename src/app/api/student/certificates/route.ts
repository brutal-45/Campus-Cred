import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const certificates = await db.certificate.findMany({
      where: { studentId: payload.userId, isValid: true },
      orderBy: { issuedDate: 'desc' },
      select: {
        id: true,
        certificateId: true,
        taskTitle: true,
        degree: true,
        branch: true,
        issuedDate: true,
        studentName: true,
        qrCodeUrl: true,
        pdfUrl: true,
      },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Certificates fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}
