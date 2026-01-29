import Link from 'next/link'

async function getOfficials() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/officials`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch officials')
  }

  return res.json()
}

export default async function Home() {
  const officials = await getOfficials()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BCHL Officials Tracker</h1>
          <p className="text-gray-600">Track officials and their game assignments</p>
        </div>

        <nav className="mb-8 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Officials
          </Link>
          <Link
            href="/games"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
          >
            Games
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Games
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  As Referee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  As Linesperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {officials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No officials found. Start by scraping game data.
                  </td>
                </tr>
              ) : (
                officials.map((official: any) => (
                  <tr key={official.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {official.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {official.totalGames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {official.refereeGames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {official.linespersonGames}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <Link href={`/officials/${official.id}`} className="hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
