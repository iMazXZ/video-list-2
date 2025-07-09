import Link from "next/link";
import { FiTv, FiPlay } from "react-icons/fi";
import {
  stripExtension,
  removeBracketedText,
  removeResolutionText,
  removeSourceAndCodec,
} from "@/lib/utils";

// Tipe data untuk video, bisa disederhanakan karena kita hanya butuh beberapa field
type SimpleVideo = {
  id: string;
  videoId: string;
  name: string;
};

interface MoreFromTagProps {
  tagName: string;
  videos: SimpleVideo[];
}

export default function MoreFromTag({ tagName, videos }: MoreFromTagProps) {
  if (!tagName || videos.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700/50 mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FiTv className="text-green-400" />
        More Episodes
      </h2>
      <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {videos.map((video) => (
          <li key={video.id} className="flex items-start gap-2">
            <FiPlay className="mt-1 text-green-400 text-xs" />
            <Link
              href={`/video/${video.videoId}`}
              className="text-gray-300 hover:text-green-400 text-sm transition-colors line-clamp-2"
              title={stripExtension(video.name)}
            >
              {/* Membersihkan judul agar mudah dibaca */}
              {removeSourceAndCodec(
                removeResolutionText(
                  removeBracketedText(stripExtension(video.name))
                )
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
