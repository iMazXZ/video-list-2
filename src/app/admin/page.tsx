import { prisma } from "@/lib/prisma";

interface Video {
  id: string;
  name: string;
  assetUrl: string;
  poster: string;
}

export default async function AdminPage() {
  const categories = await prisma.category.findMany();

  const res = await fetch("https://upnshare.com/api/v1/video/manage", {
    headers: {
      "Content-Type": "application/json",
      "Api-Token": "5915b7a9ebc9efd53900694e",
    },
    cache: "no-store",
  });

  const data = await res.json();
  const videos: Video[] = data.data.slice(0, 8);
  const videoRelations = await prisma.videoCategory.findMany();

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Assign Kategori ke Video
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {videos.map((video) => {
          const currentRelation = videoRelations.find(
            (rel) => rel.videoId === video.id
          );

          return (
            <div
              key={video.id}
              className="p-4 bg-white shadow rounded space-y-2"
            >
              <div className="flex items-center gap-4">
                <img
                  src={video.assetUrl + video.poster}
                  loading="lazy"
                  alt={video.name}
                  className="w-20 h-12 object-cover rounded"
                />
                <p className="font-medium text-gray-900 truncate">
                  {video.name}
                </p>
              </div>

              <form action="/admin/assign" method="POST" className="flex gap-2">
                <input type="hidden" name="videoId" value={video.id} />
                <select
                  name="categoryId"
                  required
                  defaultValue={currentRelation?.categoryId ?? ""}
                  className="border px-3 py-2 rounded text-gray-900"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </main>
  );
}
