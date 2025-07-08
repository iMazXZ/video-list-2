import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import RelatedVideos from "@/components/RelatedVideos";
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

// --- FUNGSI UNTUK METADATA DINAMIS ---
type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = params.id;
  const video = await prisma.video.findUnique({
    where: { videoId },
  });

  if (!video) {
    return {
      title: "Video Not Found",
      description: "The video you are looking for could not be found.",
    };
  }

  const cleanedTitle = removeSourceAndCodec(
    removeResolutionText(removeBracketedText(stripExtension(video.name)))
  );

  const posterUrl = video.poster
    ? `${video.assetUrl}${video.poster}`
    : "/default-poster.jpg";

  return {
    title: `${cleanedTitle} | VideoHub`,
    description: `Watch ${cleanedTitle} on VideoHub. High quality streaming video.`,
    openGraph: {
      title: cleanedTitle,
      description: `Watch ${cleanedTitle} on VideoHub.`,
      url: `https://videohub-taupe.vercel.app/video/${videoId}`,
      siteName: "VideoHub",
      images: [{ url: posterUrl, width: 1280, height: 720 }],
      locale: "en_US",
      type: "video.other",
    },
  };
}

// --- KOMPONEN HALAMAN ---

// Tipe data yang lebih akurat dari Prisma, termasuk semua relasi
type VideoWithDetails = Prisma.VideoGetPayload<{
  include: {
    categories: { include: { category: true } };
    tags: { include: { tag: true } };
    subtitles: true;
  };
}>;

export default async function VideoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const videoId = params.id;

  // Query utama untuk mengambil semua detail video yang dibutuhkan
  const video: VideoWithDetails | null = await prisma.video.findUnique({
    where: { videoId },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      subtitles: true,
    },
  });

  if (!video) {
    notFound();
  }

  // Logika Anda untuk video terkait berdasarkan tag pertama
  const firstTagId = video.tags[0]?.tagId;
  const relatedVideos = firstTagId
    ? await prisma.video.findMany({
        where: {
          id: { not: video.id },
          tags: { some: { tagId: firstTagId } },
        },
        take: 6,
        orderBy: { play: "desc" },
      })
    : [];

  const watchUrl = `https://nuna.upns.pro/#${video.videoId}`;
  const downloadUrl = `${watchUrl}&dl=1`;

  // Membersihkan judul video menggunakan fungsi-fungsi dari utils
  const cleanedTitle = removeSourceAndCodec(
    removeResolutionText(removeBracketedText(stripExtension(video.name)))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Tombol Kembali */}
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
          {/* Konten Utama */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pemutar Video */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
              <div className="aspect-video relative">
                <iframe
                  src={watchUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="eager"
                />
              </div>
            </div>

            {/* Info Video */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-700/50">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                {cleanedTitle}
              </h1>

              {/* Breadcrumb Kategori & Tag */}
              <nav
                className="flex items-center mb-6 text-sm text-gray-400"
                aria-label="Breadcrumb"
              >
                {video.categories.length > 0 && (
                  <>
                    <Link
                      href={`/?category=${video.categories[0].category.name}`}
                      className="hover:text-white transition-colors"
                    >
                      {video.categories[0].category.name}
                    </Link>
                  </>
                )}
                {video.tags.length > 0 && (
                  <>
                    <span className="mx-2 text-gray-500">/</span>
                    <Link
                      href={`/?tag=${video.tags[0].tag.name}`}
                      className="hover:text-white transition-colors"
                    >
                      {video.tags[0].tag.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-green-700 to-green-800 text-white px-6 py-3 rounded-full font-bold text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
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
                        href={`${video.assetUrl}${sub.url}`}
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

              {/* Stats */}
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

              {/* Embed Section */}
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <FiCode className="text-green-400" /> Share this Embed Video
                </h3>
                <div className="bg-gray-900/80 rounded-lg p-2 border border-gray-700/50 overflow-x-auto">
                  <code className="text-green-400 text-xs font-mono">{`<iframe src="${watchUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FiStar className="text-green-400" /> Video Details
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
                  value={new Date(video.createdAt).toLocaleDateString("en-US", {
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
              <div className="mt-6">
                <ShareButton />
              </div>
            </div>
          </div>
        </div>

        {/* Menampilkan Video Terkait */}
        <RelatedVideos title="Related Videos" videos={relatedVideos} />
      </div>
    </main>
  );
}

// Komponen helper
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
