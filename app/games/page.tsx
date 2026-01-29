import Link from 'next/link'

async function getGames() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/games`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch games')
  }

  return res.json()
}

export default async function GamesPage() {
  const games = await getGames()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BCHL Games</h1>
          <p className="text-gray-600">All recorded games with officials</p>
        </div>

        <nav className="mb-8 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
          >
            Officials
          </Link>
          <Link
            href="/games"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Games
          </Link>
        </nav>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linespeople
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No games found. Start by scraping game data.
                    </td>
                  </tr>
                ) : (
                  games.map((game: any) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(game.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{game.awayTeam}</div>
                        <div className="text-gray-500">@ {game.homeTeam}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {game.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {game.referees.length > 0 ? (
                          <div className="space-y-1">
                            {game.referees.map((ref: any) => (
                              <div key={ref.id}>
                                <Link
                                  href={`/officials/${ref.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {ref.name}
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {game.linespeople.length > 0 ? (
                          <div className="space-y-1">
                            {game.linespeople.map((linesperson: any) => (
                              <div key={linesperson.id}>
                                <Link
                                  href={`/officials/${linesperson.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {linesperson.name}
                                </Link>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        <a
                          href={`https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=bchl&game_id=${game.hockeytechId}&lang_id=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
