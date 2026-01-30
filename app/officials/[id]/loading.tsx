export default function Loading() {
  return (
    <main className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="bg-black rounded-lg shadow mb-16">
          {/* Name skeleton */}
          <div className="h-28 w-2/3 bg-gray-800 animate-pulse rounded mb-6"></div>

          {/* Badges skeleton */}
          <div className="mb-6 flex flex-row gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-gray-800 animate-pulse rounded-full"></div>
            ))}
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-600 rounded-lg p-4 h-32 animate-pulse"></div>
            <div className="bg-white rounded-lg p-4 h-32 animate-pulse"></div>
            <div className="bg-gray-800 rounded-lg p-4 h-32 animate-pulse border-4 border-gray-700"></div>
          </div>
        </div>

        {/* Game history skeleton */}
        <div className="h-8 w-48 bg-gray-800 animate-pulse rounded mb-4"></div>
        <div className="bg-white shadow overflow-hidden">
          <div className="bg-[#1b263d] p-4 flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 flex-1 bg-gray-700 animate-pulse rounded"></div>
            ))}
          </div>
          <div className="space-y-2 p-4 bg-black">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
