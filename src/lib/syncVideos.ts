import prisma from "@/lib/prisma";

export async function syncVideos() {
  try {
    console.log("Starting video sync...");
    
    // 1. Fetch videos from API
    const res = await fetch('https://upnshare.com/api/v1/video/manage?perPage=1000', {
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.UPNSHARE_API_TOKEN!,
      },
    });
    
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    
    const { data } = await res.json();
    
    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    console.log(`Fetched ${data.length} videos from API`);
    
    // 2. Process each video
    for (const video of data) {
      try {
        await prisma.video.upsert({
          where: { videoId: video.id },
          update: {
            name: video.name,
            poster: video.poster,
            preview: video.preview,
            assetUrl: video.assetUrl,
            createdAt: new Date(video.createdAt),
            duration: video.duration || 0,
            resolution: video.resolution || "Unknown",
            play: video.play || 0,
          },
          create: {
            videoId: video.id,
            name: video.name,
            poster: video.poster,
            preview: video.preview,
            assetUrl: video.assetUrl,
            createdAt: new Date(video.createdAt),
            duration: video.duration || 0,
            resolution: video.resolution || "Unknown",
            play: video.play || 0,
          },
        });
      } catch (error) {
        console.error(`Error processing video ${video.id}:`, error);
      }
    }
    
    console.log("Video sync completed successfully");
  } catch (error) {
    console.error("Video sync failed:", error);
    throw error;
  }
}