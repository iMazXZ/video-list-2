import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Link from "next/link";
import VideoThumbnail from "@/components/VideoThumbnail";
import Pagination from "@/components/Pagination";

interface Category {
  id: number;
  name: string;
}

interface Video {
  id: string;
  videoId: string;
  name: string;
  poster: string;
  preview: string;
  assetUrl: string;
  createdAt: Date;
  duration: number;
  resolution: string;
  play: number;
  categories: {
    category: Category;
  }[];
}

interface Props {
  searchParams: { category?: string; page?: string; sort?: string; q?: string };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export async function GET() {
  try {
    const videos = await prisma.video.findMany();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export default async function Home({ searchParams }: Props) {
  const currentPage = parseInt(searchParams.page || "1");
  const perPage = 20;
  const skip = (currentPage - 1) * perPage;
  const selectedCategory = searchParams.category;
  const sort = searchParams.sort || "newest";
  const query = searchParams.q || "";

  // Build the where clause for filtering
  const where = {
    ...(selectedCategory && {
      categories: {
        some: {
          category: { name: selectedCategory },
        },
      },
    }),
    ...(query && {
      OR: [
        { name: { contains: query } },
        { name: { contains: query.toLowerCase() } },
        { name: { contains: query.toUpperCase() } },
        { name: { contains: query.charAt(0).toUpperCase() + query.slice(1) } },
      ],
    }),
  };

  // Build the orderBy clause for sorting
  const orderBy = (() => {
    switch (sort) {
      case "az":
        return { name: "asc" as const };
      case "za":
        return { name: "desc" as const };
      case "oldest":
        return { createdAt: "asc" as const };
      default:
        return { createdAt: "desc" as const };
    }
  })();

  // Fetch data in parallel
  const [videos, totalVideos, categories] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: perPage,
      orderBy,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.video.count({ where }),
    prisma.category.findMany(),
  ]);

  const totalPages = Math.ceil(totalVideos / perPage);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={`px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                !selectedCategory
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              All
            </Link>
            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.name}`}
                className={`px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-400 text-xl">No videos found</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video: Video) => (
              <VideoThumbnail
                key={video.id}
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
            ))}
          </div>
        )}

        {/* Pagination */}
        {videos.length > 0 && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </main>
  );
}
