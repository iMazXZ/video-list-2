import VideoThumbnail from "./VideoThumbnail";
import type { Prisma } from "@prisma/client";

type Video = Prisma.VideoGetPayload<{}>;

interface RelatedVideosProps {
  title: string;
  videos: Video[];
}

export default function RelatedVideos({ title, videos }: RelatedVideosProps) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-700/50">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoThumbnail
            key={video.id}
            video={{
              ...video,
              id: video.videoId,
              createdAt: video.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}
