import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import VideoThumbnail from "@/components/VideoThumbnail";
import Pagination from "@/components/Pagination";
import VideoCarousel from "@/components/VideoCarousel";
import FilterControls from "@/components/FilterControls";
import HeroSlider from "@/components/HeroSlider";

// Tipe data untuk video, kategori, dan props
type Video = Prisma.VideoGetPayload<{}>;
type Category = Prisma.CategoryGetPayload<{}>;
interface Props {
  searchParams: {
    category?: string;
    page?: string;
    sort?: string;
    q?: string;
    tag?: string;
  };
}

// Halaman Utama
export default async function Home({ searchParams }: Props) {
  const currentPage = parseInt(searchParams.page || "1");
  const perPage = 20;
  const skip = (currentPage - 1) * perPage;
  const selectedCategory = searchParams.category;
  const selectedTag = searchParams.tag;
  const sort = searchParams.sort || "newest";
  const query = searchParams.q || "";

  const where: Prisma.VideoWhereInput = {
    ...(selectedCategory && {
      categories: { some: { category: { name: selectedCategory } } },
    }),
    ...(selectedTag && {
      tags: { some: { tag: { name: selectedTag } } },
    }),
    ...(query && {
      name: { contains: query, mode: "insensitive" },
    }),
  };

  const orderBy = (() => {
    switch (sort) {
      case "popular":
        return { play: "desc" as const };
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

  // Fetch data secara paralel
  const [
    videos,
    totalVideos,
    categories,
    trendingVideos,
    featuredVideos, // Ambil video untuk hero slider
  ] = await Promise.all([
    prisma.video.findMany({ where, skip, take: perPage, orderBy }),
    prisma.video.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.video.findMany({ orderBy: { play: "desc" }, take: 10 }),
    // --- PERUBAHAN DI SINI ---
    // Mengambil 5 video terbaru yang memiliki tag "Trending"
    prisma.video.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: "Trending", // Pastikan Anda menggunakan nama tag yang konsisten
            },
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Urutkan berdasarkan yang terbaru
      take: 5,
    }),
    // --- Jika Anda ingin menampilkan 5 video terbaru (tanpa tag), ganti query di atas dengan ini: ---
    // prisma.video.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const totalPages = Math.ceil(totalVideos / perPage);

  const isFiltered = query || selectedCategory || selectedTag;
  const filterName = query || selectedCategory || selectedTag;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto py-8 space-y-12">
        {!isFiltered ? (
          <>
            <div className="hidden md:block px-4 sm:px-6 lg:px-8">
              <HeroSlider videos={featuredVideos} />
            </div>

            <VideoCarousel title="Trending Now" videos={trendingVideos} />

            <div>
              <h2 className="text-2xl font-bold text-white px-4 sm:px-6 lg:px-8 mb-4">
                Recently Added
              </h2>
              <div className="px-4 sm:px-6 lg:px-8">
                <FilterControls categories={categories} />
              </div>
              <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 sm:p-6 lg:p-8">
                {videos.map((video) => (
                  <VideoThumbnail
                    key={video.id}
                    video={{
                      ...video,
                      id: video.videoId,
                      createdAt: video.createdAt.toISOString(),
                    }}
                  />
                ))}
              </div>
              {videos.length > 0 && totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </div>
          </>
        ) : (
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-3xl font-bold">{filterName}</h2>
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-xl">No videos found.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {videos.map((video) => (
                    <VideoThumbnail
                      key={video.id}
                      video={{
                        ...video,
                        id: video.videoId,
                        createdAt: video.createdAt.toISOString(),
                      }}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
