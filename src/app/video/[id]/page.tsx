import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import {
  formatDuration,
  formatNumber,
  stripExtension,
  removeBracketedText,
  removeResolutionText,
  removeSourceAndCodec,
} from "@/lib/utils";
import {
  FiArrowLeft,
  FiEye,
  FiDownload,
  FiClock,
  FiFilm,
  FiCalendar,
  FiStar,
  FiCode,
} from "react-icons/fi";
import prisma from "@/lib/prisma";

interface Video {
  id: string;
  videoId: string;
  name: string;
  poster: string;
  preview: string;
  assetUrl: string;
  duration: number;
  resolution: string;
  play: number;
  download: number;
  codec: string | null;
  createdAt: Date;
  categories: {
    category: {
      id: number;
      name: string;
    };
  }[];
  subtitles: {
    id: string;
    name: string;
    url: string;
    language: string | null;
  }[];
}

export default async function VideoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const videoId = params.id;

  // Fetch video from database with subtitles
  const video = await prisma.video.findUnique({
    where: { videoId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      subtitles: true,
    },
  });

  if (!video) {
    notFound();
  }

  // Use external player URLs
  const watchUrl = `https://nuna.upns.pro/#${video.videoId}`;
  const downloadUrl = `${watchUrl}&dl=1`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back Button */}
      <div className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-all duration-300 group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">See More Videos</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Wider Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
              <div className="aspect-video relative">
                <iframe
                  src={watchUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Video Info Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700/50">
              <h1 className="text-xl sm:text-xl md:text-xl font-bold text-white mb-4 leading-tight">
                {removeSourceAndCodec(
                  removeResolutionText(
                    removeBracketedText(stripExtension(video.name))
                  )
                )}
              </h1>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatBadge
                  icon={<FiEye />}
                  label="Views"
                  value={formatNumber(video.play)}
                />
                <StatBadge
                  icon={<FiDownload />}
                  label="Downloads"
                  value={formatNumber(video.download)}
                />
                <StatBadge
                  icon={<FiFilm />}
                  label="Resolution"
                  value={video.resolution}
                />
                <StatBadge
                  icon={<FiClock />}
                  label="Duration"
                  value={formatDuration(video.duration)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  <FiDownload className="w-4 h-4" />
                  Download Video
                </a>
              </div>

              {/* Subtitles Section */}
              {video.subtitles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z" />
                    </svg>
                    Download Subtitles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {video.subtitles.map((sub) => (
                      <a
                        key={sub.id}
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        {sub.name || sub.language || "Subtitle"}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Embed Section */}
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <FiCode className="text-green-400" />
                  Share this Embed Video
                </h3>
                <div className="bg-gray-900/80 rounded-lg p-2 border border-gray-700/50 overflow-x-auto">
                  <code className="text-green-400 text-xs font-mono">
                    {`<iframe src="${watchUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Sticky Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiStar className="text-green-400" />
                Video Details
              </h2>

              <div className="space-y-4">
                <DetailItem
                  icon={<FiFilm />}
                  label="Resolution"
                  value={video.resolution}
                />
                <DetailItem
                  icon={<FiClock />}
                  label="Duration"
                  value={formatDuration(video.duration)}
                />
                <DetailItem
                  icon={<FiCalendar />}
                  label="Uploaded"
                  value={video.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                />
                {video.codec && (
                  <DetailItem
                    icon={<FiCode />}
                    label="Codec"
                    value={video.codec}
                  />
                )}
              </div>

              {/* Quality Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">
                    Premium Quality
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1.5">
                  {video.resolution} resolution • {video.codec || "Unknown"}{" "}
                  codec
                </p>
              </div>

              {/* Share Button */}
              <div className="mt-6">
                <ShareButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-2">
      <span className="text-green-400">{icon}</span>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="font-medium text-white">{value}</div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-green-400">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-white font-medium text-sm">{value}</span>
    </div>
  );
}
