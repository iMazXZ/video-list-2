import { prisma } from "@/lib/prisma";

export default async function CategoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await prisma.category.findUnique({
    where: { id: Number(params.id) },
  });

  const relations = await prisma.videoCategory.findMany({
    where: { categoryId: Number(params.id) },
  });

  const videoIds = relations.map((rel) => rel.videoId);

  const res = await fetch("https://upnshare.com/api/v1/video/manage", {
    headers: {
      "Content-Type": "application/json",
      "Api-Token": process.env.UPNSHARE_API_TOKEN!,
    },
    cache: "no-store",
  });

  const data = await res.json();
  const videos = data.data.filter((video: any) => videoIds.includes(video.id));

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Kategori: {category?.name}
      </h1>

      {videos.length === 0 ? (
        <p className="text-gray-600">Belum ada video dalam kategori ini.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {videos.map((video: any) => (
            <div
              key={video.id}
              className="p-4 bg-white shadow rounded space-y-2"
            >
              <img
                src={video.assetUrl + video.poster}
                className="w-full h-36 object-cover rounded"
                alt={video.name}
              />
              <p className="font-semibold text-gray-900">{video.name}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
