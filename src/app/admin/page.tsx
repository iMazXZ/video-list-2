import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import AdminPagination from "@/components/AdminPagination";
import SyncManager from "@/components/SyncManager";
import AuthButton from "@/components/AuthButton";
import CategoryManager from "@/components/CategoryManager";
import AdminVideoGrid from "@/components/AdminVideoGrid";

interface Props {
  searchParams: { page?: string; q?: string; category?: string };
}

export default async function AdminPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  const currentPage = parseInt(searchParams.page || "1");
  const perPage = 20;
  const searchQuery = searchParams.q || "";
  const selectedCategoryFilter = searchParams.category || "";
  const skip = (currentPage - 1) * perPage;

  const where: Prisma.VideoWhereInput = {
    ...(selectedCategoryFilter && {
      categories: { some: { category: { name: selectedCategoryFilter } } },
    }),
    ...(searchQuery && {
      name: { contains: searchQuery, mode: "insensitive" },
    }),
  };

  const [videos, totalVideos, allCategories] = await Promise.all([
    prisma.video.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } }, // <-- Perubahan ada di sini
      },
    }),
    prisma.video.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalVideos / perPage);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Video Management
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

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                  !selectedCategoryFilter
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                All
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/admin?category=${cat.name}`}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedCategoryFilter === cat.name
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
              <CategoryManager categories={allCategories} />
            </div>
          </div>
        </div>

        {/* Video Grid Section */}
        {videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-400 text-xl">
              No videos found for the current filter.
            </p>
          </div>
        ) : (
          <>
            <AdminVideoGrid videos={videos} allCategories={allCategories} />
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
