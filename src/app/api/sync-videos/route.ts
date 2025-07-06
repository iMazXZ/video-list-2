// app/api/sync-videos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface VideoData {
  id: string;
  name: string;
  poster: string;
  assetUrl: string;
  createdAt: string;
  duration?: number;
  resolution?: string;
  play?: number;
  preview?: string; // Add this if your Prisma model requires it
}

export async function POST() {
  try {
    const lastVideo = await prisma.video.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const apiUrl = new URL('https://upnshare.com/api/v1/video/manage');
    apiUrl.searchParams.append('perPage', '100');
    if (lastVideo) {
      apiUrl.searchParams.append('createdAfter', lastVideo.createdAt.toISOString());
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Api-Token': process.env.UPNSHARE_API_TOKEN!,
      },
    });

    const { data: newVideos = [] } = await response.json();

    // Process new videos
    const results = await Promise.all(
      newVideos.map((video: VideoData) =>
        prisma.video.upsert({
          where: { videoId: video.id },
          update: {
            name: video.name,
            poster: video.poster,
            assetUrl: video.assetUrl,
            duration: video.duration || 0,
            resolution: video.resolution || 'HD',
            play: video.play || 0,
            preview: video.preview || '', // Add default value if required
          },
          create: {
            videoId: video.id,
            name: video.name,
            poster: video.poster,
            assetUrl: video.assetUrl,
            createdAt: new Date(video.createdAt),
            duration: video.duration || 0,
            resolution: video.resolution || 'HD',
            play: video.play || 0,
            preview: video.preview || '', // Add default value if required
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      newVideos: results.length,
      message: `Added ${results.length} new videos`
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to sync videos' },
      { status: 500 }
    );
  }
}