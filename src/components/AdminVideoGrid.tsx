"use client";

import { useState, useTransition } from "react";
import type { Prisma } from "@prisma/client";
import { FiCheckSquare, FiSquare, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { assignCategory } from "@/actions/assignCategory";
import { bulkAssignCategory } from "@/actions/bulkAssignCategory";
import TagManager from "./TagManager"; // Impor TagManager
import {
  stripExtension,
  removeBracketedText,
  removeResolutionText,
  removeSourceAndCodec,
} from "@/lib/utils";

// Tipe data yang kita butuhkan, sekarang termasuk tags
type Category = { id: number; name: string };
type VideoWithRelations = Prisma.VideoGetPayload<{
  include: {
    categories: { include: { category: true } };
    tags: { include: { tag: true } }; // Pastikan relasi tag disertakan
  };
}>;

interface AdminVideoGridProps {
  videos: VideoWithRelations[];
  allCategories: Category[];
}

export default function AdminVideoGrid({
  videos,
  allCategories,
}: AdminVideoGridProps) {
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedVideoIds.size === videos.length) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(videos.map((v) => v.id)));
    }
  };

  const handleBulkAssign = (formData: FormData) => {
    const categoryId = Number(formData.get("bulkCategoryId"));
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    startTransition(async () => {
      const result = await bulkAssignCategory(
        Array.from(selectedVideoIds),
        categoryId
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Videos updated!");
        setSelectedVideoIds(new Set());
      }
    });
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts = [];
    if (h > 0) parts.push(String(h).padStart(2, "0"));
    parts.push(String(m).padStart(2, "0"));
    parts.push(String(s).padStart(2, "0"));
    return parts.join(":");
  };

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedVideoIds.size > 0 && (
        <div className="sticky top-16 z-10 bg-gray-700 p-3 rounded-lg shadow-lg flex items-center justify-between gap-4 transition-all duration-300">
          <p className="text-white font-medium">
            {selectedVideoIds.size} video(s) selected
          </p>
          <form action={handleBulkAssign} className="flex items-center gap-2">
            <select
              name="bulkCategoryId"
              required
              className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Assign to...
              </option>
              {allCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 disabled:bg-blue-400"
            >
              {isPending ? <FiLoader className="animate-spin" /> : "Apply"}
            </button>
          </form>
        </div>
      )}

      {/* Select All Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
        >
          {selectedVideoIds.size === videos.length ? (
            <FiCheckSquare />
          ) : (
            <FiSquare />
          )}
          {selectedVideoIds.size === videos.length
            ? "Deselect All"
            : "Select All"}
        </button>
      </div>

      {/* Redesigned Video Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => {
          const currentCategoryId = video.categories[0]?.category.id;
          const isSelected = selectedVideoIds.has(video.id);
          return (
            <div
              key={video.id}
              className={`bg-gray-800 rounded-lg border-2 ${
                isSelected ? "border-blue-500" : "border-gray-700"
              } shadow-lg flex flex-col transition-all duration-200`}
            >
              {/* Video Info Section */}
              <div className="p-4 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={`${video.assetUrl}${video.poster}`}
                      loading="lazy"
                      alt={video.name}
                      className="w-28 h-16 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {removeSourceAndCodec(
                        removeResolutionText(
                          removeBracketedText(stripExtension(video.name))
                        )
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {video.play.toLocaleString()} views •{" "}
                      {formatDuration(video.duration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="p-4 bg-gray-900/50 rounded-b-lg border-t border-gray-700 space-y-3">
                {/* Single Category Assignment */}
                <form action={assignCategory} className="flex gap-2">
                  <input type="hidden" name="videoId" value={video.id} />
                  <select
                    name="categoryId"
                    required
                    defaultValue={currentCategoryId || ""}
                    className="flex-1 border border-gray-600 px-3 py-2 rounded-md text-xs text-white bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium"
                  >
                    Save
                  </button>
                </form>

                {/* TagManager Component */}
                <TagManager videoId={video.id} initialTags={video.tags} />

                {/* Selection Checkbox */}
                <button
                  onClick={() => handleSelectVideo(video.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 p-2 rounded-md transition-colors"
                >
                  {isSelected ? (
                    <FiCheckSquare className="text-blue-400" />
                  ) : (
                    <FiSquare />
                  )}
                  {isSelected ? "Deselect" : "Select for Bulk Action"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
