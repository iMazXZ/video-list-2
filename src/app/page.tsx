import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

interface Video {
  id: string;
  name: string;
  poster: string;
  preview: string;
  assetUrl: string;
  createdAt: string;
}

interface Props {
  searchParams: { category?: string; page?: string; sort?: string; q?: string };
}

export default async function Home({ searchParams }: Props) {
  const currentPage = parseInt(searchParams.page || "1");
  const selectedCategory = searchParams.category;
  const sort = searchParams.sort || "newest";
  const query = (searchParams.q || "").toLowerCase();

  // Ambil semua kategori
  const categories = await prisma.category.findMany();

  // Jika ada kategori dipilih, ambil id video yang cocok
  const relatedVideos = selectedCategory
    ? await prisma.videoCategory.findMany({
        where: { category: { name: selectedCategory } },
        select: { videoId: true },
      })
    : [];

  // Ambil 1 halaman video dari API
  const res = await fetch(
    `https://upnshare.com/api/v1/video/manage?page=${currentPage}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Api-Token": process.env.UPNSHARE_API_TOKEN!,
      },
      cache: "no-store",
    }
  );

  const data = await res.json();
  let videos: Video[] = data.data;

  // Ambil total video (tanpa pagination) dari endpoint statistik
  const statsRes = await fetch("https://upnshare.com/api/v1/video", {
    headers: {
      "Content-Type": "application/json",
      "Api-Token": process.env.UPNSHARE_API_TOKEN!,
    },
    cache: "no-store",
  });

  const stats = await statsRes.json();
  const totalVideos = stats.video;
  const totalPages = Math.ceil(totalVideos / 20);

  // Jika ada kategori dipilih, filter id-nya
  if (selectedCategory) {
    const allowedIds = relatedVideos.map((v) => v.videoId);
    videos = videos.filter((v) => allowedIds.includes(v.id));
  }

  // Filter search query
  if (query) {
    videos = videos.filter((v) => v.name.toLowerCase().includes(query));
  }

  // Urutkan video
  if (sort === "az") {
    videos.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "za") {
    videos.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sort === "oldest") {
    videos.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else {
    videos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <main className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Daftar Video {selectedCategory ? `- ${selectedCategory}` : ""}
      </h1>

      {/* Search & Sort */}
      <form method="GET" className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          name="q"
          placeholder="Cari video..."
          defaultValue={query}
          className="px-4 py-2 border rounded text-gray-900"
        />

        <select
          name="sort"
          defaultValue={sort}
          className="px-4 py-2 border rounded text-gray-900"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Terapkan
        </button>
      </form>

      {/* Filter Kategori */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/"
          className={`px-3 py-1 rounded text-gray-900 ${
            !selectedCategory ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.name}`}
            className={`px-3 py-1 rounded text-gray-900 ${
              selectedCategory === cat.name
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Daftar Video */}
      {videos.length === 0 ? (
        <p className="text-gray-500">Tidak ada video untuk kategori ini.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const posterUrl = `${video.assetUrl}${video.poster}`;
            const previewUrl = `${video.assetUrl}${video.preview}`;

            return (
              <div
                key={video.id}
                className="relative group bg-white rounded shadow overflow-hidden"
              >
                <div className="aspect-video w-full bg-black">
                  <img
                    src={posterUrl}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:hidden"
                  />
                  <video
                    src={previewUrl}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover hidden group-hover:block"
                    autoPlay
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-md text-gray-900 truncate">
                    {video.name}
                  </h2>
                  <a
                    href={`https://nuna.upns.pro/#${video.id}`}
                    target="_blank"
                    className="text-sm text-blue-500 underline"
                  >
                    Tonton Sekarang
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {videos.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          {/* Prev */}
          {currentPage > 1 && (
            <Link
              href={`/?page=${currentPage - 1}${
                selectedCategory ? `&category=${selectedCategory}` : ""
              }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
              className="px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              ← Prev
            </Link>
          )}

          {/* Pages */}
          {(() => {
            const pages: (number | "...")[] = [];

            if (totalPages <= 10) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              if (currentPage <= 5) {
                for (let i = 1; i <= 7; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
              } else if (currentPage >= totalPages - 4) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 6; i <= totalPages; i++)
                  pages.push(i);
              } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 2; i <= currentPage + 2; i++)
                  pages.push(i);
                pages.push("...");
                pages.push(totalPages);
              }
            }

            return pages.map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="px-4 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <Link
                  key={page}
                  href={`/?page=${page}${
                    selectedCategory ? `&category=${selectedCategory}` : ""
                  }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
                  className={`px-4 py-2 rounded ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </Link>
              )
            );
          })()}

          {/* Next */}
          {currentPage < totalPages && (
            <Link
              href={`/?page=${currentPage + 1}${
                selectedCategory ? `&category=${selectedCategory}` : ""
              }${sort ? `&sort=${sort}` : ""}${query ? `&q=${query}` : ""}`}
              className="px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
