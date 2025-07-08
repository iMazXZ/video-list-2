import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// Interface diperbarui untuk menerima nilai opsional/nullable
interface VideoData {
  id: string;
  name: string;
  poster?: string | null; // Diubah menjadi opsional/nullable
  assetUrl: string;
  createdAt: string;
  duration?: number;
  resolution?: string;
  play?: number;
  preview?: string | null; // Diubah menjadi opsional/nullable
  download?: number;
  codec?: string;
}

interface VideoFile {
  id: string;
  type: string;
  name: string;
  extension: string;
  language: string | null;
  url: string | null;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const syncType = searchParams.get('syncType') || 'latest';

    if (syncType === 'full') {
      console.log('Starting FULL video sync...');
      
      let allApiVideos: VideoData[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const apiUrl = new URL('https://upnshare.com/api/v1/video/manage');
        apiUrl.searchParams.append('perPage', perPage.toString());
        apiUrl.searchParams.append('page', page.toString());
        const response = await fetch(apiUrl.toString(), { headers: { 'Content-Type': 'application/json', 'Api-Token': process.env.UPNSHARE_API_TOKEN! } });
        if (!response.ok) { 
            console.error(`API request failed with status ${response.status} for page ${page}.`); 
            break; 
        }
        const { data: pageVideos = [] } = await response.json();
        if (pageVideos.length === 0) break;
        allApiVideos = [...allApiVideos, ...pageVideos];
        if (pageVideos.length < perPage) break;
        page++;
      }
      console.log(`Finished fetching. Total videos from API: ${allApiVideos.length}`);

      const dbVideos = await prisma.video.findMany({ select: { id: true, videoId: true } });

      const BATCH_SIZE = 10;
      const DELAY_BETWEEN_BATCHES_MS = 1000;
      for (let i = 0; i < allApiVideos.length; i += BATCH_SIZE) {
          const batch = allApiVideos.slice(i, i + BATCH_SIZE);
          await Promise.all(batch.map(async (video) => {
              // Logika upsert diperbarui untuk menangani null
              await prisma.video.upsert({
                  where: { videoId: video.id },
                  update: { 
                    name: video.name, 
                    poster: video.poster || null, 
                    assetUrl: video.assetUrl, 
                    duration: video.duration || 0, 
                    resolution: video.resolution || 'HD', 
                    play: video.play || 0, 
                    preview: video.preview || null,
                    download: video.download || 0,
                    codec: video.codec || null,
                  },
                  create: { 
                    videoId: video.id, 
                    name: video.name, 
                    poster: video.poster || null, 
                    assetUrl: video.assetUrl, 
                    createdAt: new Date(video.createdAt), 
                    duration: video.duration || 0, 
                    resolution: video.resolution || 'HD', 
                    play: video.play || 0, 
                    preview: video.preview || null,
                    download: video.download || 0,
                    codec: video.codec || null,
                  },
              });
          }));
          if (i + BATCH_SIZE < allApiVideos.length) {
              await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
          }
      }

      const apiVideoIds = new Set(allApiVideos.map(v => v.id));
      const videosToDelete = dbVideos.filter(dbVideo => !apiVideoIds.has(dbVideo.videoId));
      let deletedCount = 0;
      if (videosToDelete.length > 0) {
          const idsToDelete = videosToDelete.map(v => v.id);
          await prisma.$transaction([
              prisma.subtitle.deleteMany({ where: { videoId: { in: idsToDelete } } }),
              prisma.video.deleteMany({ where: { id: { in: idsToDelete } } })
          ]);
          deletedCount = videosToDelete.length;
          console.log(`Deleted ${deletedCount} videos.`);
      }

      return NextResponse.json({ success: true, message: `Full sync complete. Processed ${allApiVideos.length} videos, deleted ${deletedCount} videos.` });

    } else {
      console.log('Fetching the latest 20 videos from API...');
      const apiUrl = new URL('https://upnshare.com/api/v1/video/manage');
      apiUrl.searchParams.append('perPage', '20');
      apiUrl.searchParams.append('page', '1');
      const response = await fetch(apiUrl.toString(), { headers: { 'Content-Type': 'application/json', 'Api-Token': process.env.UPNSHARE_API_TOKEN! } });
      if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); }
      const { data: latestVideos = [] } = await response.json();

      const processedVideos = await Promise.all(
        latestVideos.map(async (video: VideoData) => {
          let subtitleFiles: VideoFile[] = [];
          try {
            const filesResponse = await fetch(`https://upnshare.com/api/v1/video/manage/${video.id}/files`, { headers: { 'Content-Type': 'application/json', 'Api-Token': process.env.UPNSHARE_API_TOKEN! } });
            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              subtitleFiles = Array.isArray(filesData) ? filesData.filter((f: VideoFile) => f.type === 'Subtitle' && f.url) : [];
            }
          } catch (error) { console.error(`Network error fetching subtitles for video ${video.id}:`, error); }

          // Logika upsert diperbarui untuk menangani null
          const videoRecord = await prisma.video.upsert({
            where: { videoId: video.id },
            update: { 
              name: video.name, 
              poster: video.poster || null, 
              assetUrl: video.assetUrl, 
              duration: video.duration || 0, 
              resolution: video.resolution || 'HD', 
              play: video.play || 0, 
              preview: video.preview || null,
              download: video.download || 0,
              codec: video.codec || null,
            },
            create: { 
              videoId: video.id, 
              name: video.name, 
              poster: video.poster || null, 
              assetUrl: video.assetUrl, 
              createdAt: new Date(video.createdAt), 
              duration: video.duration || 0, 
              resolution: video.resolution || 'HD', 
              play: video.play || 0, 
              preview: video.preview || null,
              download: video.download || 0,
              codec: video.codec || null,
            },
          });

          if (subtitleFiles.length > 0) {
            await prisma.$transaction([
              prisma.subtitle.deleteMany({ where: { videoId: videoRecord.id } }),
              prisma.subtitle.createMany({ data: subtitleFiles.map(sub => ({ id: sub.id, name: sub.name || `Subtitle_${sub.language || 'unknown'}`, url: sub.url!, language: sub.language, videoId: videoRecord.id })) })
            ]);
          }
          return videoRecord;
        })
      );

      return NextResponse.json({ success: true, processedVideos: processedVideos.length, message: `Synced ${processedVideos.length} latest videos from API.` });
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync videos', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
