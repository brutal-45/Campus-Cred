import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const isPaid = searchParams.get('paid');
    const isRemote = searchParams.get('remote');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { status: 'Open' };

    if (isPaid === 'true') where.isPaid = true;
    if (isPaid === 'false') where.isPaid = false;
    if (isRemote === 'true') where.isRemote = true;

    if (branch) {
      where.branches = { contains: branch };
    }
    if (location) {
      where.location = { contains: location };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const internships = await db.internship.findMany({
      where,
      include: {
        company: true,
        applicants: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.internship.count({ where });

    const enriched = internships.map((intern) => ({
      id: intern.id,
      title: intern.title,
      slug: intern.slug,
      description: intern.description,
      branches: JSON.parse(intern.branches || '[]'),
      degrees: JSON.parse(intern.degrees || '[]'),
      duration: intern.duration,
      isPaid: intern.isPaid,
      stipend: intern.stipend,
      location: intern.location,
      isRemote: intern.isRemote,
      deadline: intern.deadline,
      status: intern.status,
      createdAt: intern.createdAt,
      applicantCount: intern.applicants.length,
      company: {
        id: intern.company.id,
        companyName: intern.company.companyName,
        logoUrl: intern.company.logoUrl,
        industry: intern.company.industry,
        location: intern.company.location,
        isVerified: intern.company.isVerified,
      },
    }));

    return NextResponse.json({
      internships: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Public internships fetch error:', error);
    return NextResponse.json({
      internships: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    });
  }
}
