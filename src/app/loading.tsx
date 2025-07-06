// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated Loading Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 h-16 animate-pulse"></div>

      {/* Main Loading Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Loading */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-gray-700 rounded-full mb-6 animate-pulse"></div>
          <div className="flex flex-wrap gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 bg-gray-800 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Video Grid Loading */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Video Thumbnail */}
              <div
                className="aspect-video bg-gray-800 rounded-2xl overflow-hidden relative animate-pulse"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 opacity-20"></div>
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded-full w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center mt-16">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div
              className="absolute inset-1 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
