import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = {};

    if (state) where.state = state;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { collegeName: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const colleges = await db.college.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.college.count({ where });

    return NextResponse.json({
      colleges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Public colleges fetch error:', error);
    return NextResponse.json({
      colleges: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
  }
}
