"use client";

import { useRef } from "react";
import type { Prisma } from "@prisma/client";
import VideoThumbnail from "./VideoThumbnail";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Video = Prisma.VideoGetPayload<{}>;

interface VideoCarouselProps {
  title: string;
  videos: Video[];
}

export default function VideoCarousel({ title, videos }: VideoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white px-4 sm:px-6 lg:px-8">
        {title}
      </h2>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 px-4 sm:px-6 lg:px-8 py-2"
        >
          {videos.map((video) => (
            <div key={video.id} className="w-64 md:w-72 flex-shrink-0">
              <VideoThumbnail
                video={{
                  id: video.videoId,
                  name: video.name,
                  poster: video.poster,
                  preview: video.preview,
                  assetUrl: video.assetUrl,
                  createdAt: video.createdAt.toISOString(),
                  duration: video.duration,
                  resolution: video.resolution,
                  play: video.play,
                }}
              />
            </div>
          ))}
        </div>
        {/* Scroll Buttons */}
        <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-2 pointer-events-none">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-opacity"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-opacity"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper CSS untuk menyembunyikan scrollbar
const style = `
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
`;

if (typeof window !== "undefined") {
  const stylesheet = document.createElement("style");
  stylesheet.innerHTML = style;
  document.head.appendChild(stylesheet);
}
