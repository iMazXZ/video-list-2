"use client";

import { useState, useEffect, useCallback } from "react";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { FiPlayCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Video = Prisma.VideoGetPayload<{}>;

interface HeroSliderProps {
  videos: Video[];
}

export default function HeroSlider({ videos }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? videos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = useCallback(() => {
    const isLastSlide = currentIndex === videos.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, videos.length]);

  useEffect(() => {
    // Set interval untuk auto-slide setiap 5 detik
    const slideInterval = setInterval(goToNext, 5000);
    // Hapus interval saat komponen di-unmount
    return () => clearInterval(slideInterval);
  }, [goToNext]);

  if (!videos || videos.length === 0) {
    return null;
  }

  const activeVideo = videos[currentIndex];

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[400px] md:min-h-[500px] bg-gray-900 border border-gray-700/50 group">
      {/* Background Images Container */}
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
        >
          <img
            src={`${video.assetUrl}${video.poster}`}
            alt={video.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex items-end w-full h-full p-6 md:p-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg transition-all duration-500">
            {activeVideo.name}
          </h1>
          <p className="mt-4 text-gray-300 line-clamp-2 transition-all duration-500">
            {activeVideo.play.toLocaleString()} views •{" "}
            {new Date(activeVideo.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
          <Link
            href={`/video/${activeVideo.videoId}`}
            className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <FiPlayCircle size={24} />
            Watch Now
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute z-20 top-1/2 -translate-y-1/2 w-full flex justify-between px-4">
        <button
          onClick={goToPrevious}
          className="bg-black/40 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="bg-black/40 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiChevronRight size={24} />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute z-20 bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
