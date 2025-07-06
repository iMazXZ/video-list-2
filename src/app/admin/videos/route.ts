// app/api/admin/videos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get('skip') || '0');
  const take = parseInt(searchParams.get('take') || '8');
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  try {
    const where = {
      ...(category && {
        categories: {
          some: {
            category: { name: category },
          },
        },
      }),
      ...(searchQuery && {
        name: { contains: searchQuery, mode: 'insensitive' },
      }),
    };

    const [videos, totalVideos, categories] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.video.count({ where }),
      prisma.category.findMany(),
    ]);

    return NextResponse.json({
      videos,
      totalVideos,
      categories,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}