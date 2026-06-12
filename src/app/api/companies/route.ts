import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = {};

    if (industry) where.industry = industry;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { description: { contains: search } },
        { industry: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const companies = await db.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.company.count({ where });

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Public companies fetch error:', error);
    return NextResponse.json({
      companies: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
  }
}
