"use client";

import { useState, useTransition } from "react";
import { updateVideoTags } from "@/actions/updateVideoTags";
import { toast } from "react-hot-toast";
import { FiLoader, FiTag } from "react-icons/fi";

interface Tag {
  tag: { id: number; name: string };
}

interface TagManagerProps {
  videoId: string;
  initialTags: Tag[];
}

export default function TagManager({ videoId, initialTags }: TagManagerProps) {
  // Ubah array objek tag menjadi string yang dipisahkan koma
  const tagsString = initialTags.map((t) => t.tag.name).join(", ");
  const [currentTags, setCurrentTags] = useState(tagsString);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateVideoTags(videoId, currentTags);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Tags updated!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
        <FiTag size={12} />
        Tags (comma-separated)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={currentTags}
          onChange={(e) => setCurrentTags(e.target.value)}
          placeholder="e.g. react, nextjs, tutorial"
          disabled={isPending}
          className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center disabled:bg-gray-500"
        >
          {isPending ? <FiLoader className="animate-spin" /> : "Update"}
        </button>
      </div>
    </form>
  );
}
