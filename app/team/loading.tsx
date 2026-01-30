export default function Loading() {
  return (
    <main className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="h-24 w-3/4 bg-gray-800 animate-pulse rounded mb-2"></div>
          <div className="h-6 w-64 bg-gray-800 animate-pulse rounded"></div>
        </div>

        {/* Season tabs skeleton */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-800 animate-pulse rounded"></div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-bchl-navy shadow overflow-hidden">
          <div className="bg-bchl-navy p-4 flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 flex-1 bg-gray-800 animate-pulse rounded"></div>
            ))}
          </div>
          <div className="space-y-2 p-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
