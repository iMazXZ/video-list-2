"use client";

import { stripExtension } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import Link from "next/link";
import { useState, useRef } from "react";
import { FiTrendingUp } from "react-icons/fi";
import { HiFire } from "react-icons/hi";

interface VideoThumbnailProps {
  video: {
    id: string;
    name: string;
    poster: string;
    preview: string;
    assetUrl: string;
    duration: number;
    resolution: string;
    createdAt: string;
    play: number;
  };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function VideoThumbnail({ video }: VideoThumbnailProps) {
  const posterUrl = `${video.assetUrl}${video.poster}`;
  const previewUrl = `${video.assetUrl}${video.preview}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isTrending = video.play > 100; // Determine if video is trending

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .catch((e) => console.error("Video play failed:", e));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-105"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/video/${video.id}`} className="block">
        {/* Video Thumbnail */}
        <div className="aspect-video relative overflow-hidden rounded-t-3xl">
          <img
            src={posterUrl}
            alt={video.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? "scale-110 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <video
            ref={videoRef}
            src={previewUrl}
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Duration Badge */}
          <div className="absolute bottom-1 right-1 bg-black/20 text-white text-xs px-3 py-1 rounded-full font-medium">
            {formatDuration(video.duration)}
          </div>

          {/* Quality Badge */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold">
            {video.resolution === "HD"
              ? "720p"
              : video.resolution === "FHD"
              ? "1080p"
              : video.resolution === "SD"
              ? "480p"
              : video.resolution}
          </div>

          {/* HOT Badge - Only shows if views > 100 */}
          {isTrending && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-400 to-red-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
              <HiFire className="w-4 h-4" />
              <span>HOT</span>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h3
            className={`font-bold text-sm text-white mb-1 line-clamp-2 transition-colors duration-300 ${
              isHovered ? "text-green-400" : ""
            }`}
          >
            {stripExtension(video.name)}
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-xs">
              {formatRelativeTime(video.createdAt)}
            </p>
            <div className="flex items-center gap-1">
              {isTrending && (
                <FiTrendingUp className="w-3 h-3 text-amber-400" />
              )}
              <p
                className={`text-xs ${
                  isTrending ? "text-amber-400" : "text-gray-400"
                }`}
              >
                {video.play?.toLocaleString()} views
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
