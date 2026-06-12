import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { status: 'Published' };

    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const posts = await db.blogPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, fullName: true, profilePhoto: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.blogPost.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json({
      posts: [],
      pagination: { page: 1, limit: 9, total: 0, totalPages: 0 },
    });
  }
}
