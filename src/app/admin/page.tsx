import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AdminPagination from "@/components/AdminPagination";
import SyncManager from "@/components/SyncManager";
import AuthButton from "@/components/AuthButton";

interface Video {
  id: string;
  videoId: string;
  name: string;
  poster: string;
  assetUrl: string;
  createdAt: Date;
  duration: number;
  resolution: string;
  play: number;
  categories: {
    category: {
      id: number;
      name: string;
    };
  }[];
}

interface Props {
  searchParams: { page?: string; q?: string; category?: string };
}

export default async function AdminPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  // Pagination setup
  const currentPage = parseInt(searchParams.page || "1");
  const perPage = 20;
  const searchQuery = searchParams.q || "";
  const selectedCategory = searchParams.category || "";
  const skip = (currentPage - 1) * perPage;

  // Build the where clause for filtering
  const where = {
    ...(selectedCategory && {
      categories: {
        some: {
          category: { name: selectedCategory },
        },
      },
    }),
    ...(searchQuery && {
      OR: [
        {
          name: {
            contains: searchQuery,
          },
        },
        {
          name: {
            contains: searchQuery.toLowerCase(),
          },
        },
        {
          name: {
            contains: searchQuery.toUpperCase(),
          },
        },
      ],
    }),
  };

  // Fetch data
  const [videos, totalVideos, categories] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
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

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h > 0 ? h : null, m, s]
      .filter(Boolean)
      .map((v) => String(v).padStart(2, "0"))
      .join(":");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Video Category Management
            </h1>
            <div className="flex items-center gap-4">
              <SyncManager />
              <AuthButton />
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form className="flex-1 flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="Search videos..."
                defaultValue={searchQuery}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className={`px-4 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  !selectedCategory
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/admin?category=${cat.name}`}
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
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-400 text-xl">No videos found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="p-4 bg-gray-800 rounded-lg space-y-3 border border-gray-700 shadow-lg"
                >
                  {/* Video Thumbnail and Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={`${video.assetUrl}${video.poster}`}
                        loading="lazy"
                        alt={video.name}
                        className="w-24 h-14 object-cover rounded-lg"
                      />
                      {video.resolution && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {video.resolution === "HD"
                            ? "720p"
                            : video.resolution === "FHD"
                            ? "1080p"
                            : video.resolution === "SD"
                            ? "SD"
                            : video.resolution}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {video.name}
                      </p>
                      {video.duration && (
                        <p className="text-xs text-gray-400">
                          {formatDuration(video.duration)}
                        </p>
                      )}
                      {video.play && (
                        <p className="text-xs text-gray-400">
                          {video.play.toLocaleString()} views
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Assignment Form */}
                  <form
                    action="/admin/assign"
                    method="POST"
                    className="space-y-2"
                  >
                    <input type="hidden" name="videoId" value={video.id} />
                    <div className="flex gap-2">
                      <select
                        name="categoryId"
                        required
                        className="flex-1 border border-gray-600 px-3 py-2 rounded-md text-sm text-white bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="" className="text-gray-400">
                          Select Category
                        </option>
                        {categories.map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id.toString()}
                            className="text-gray-900"
                          >
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
