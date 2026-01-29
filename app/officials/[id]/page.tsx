import Link from 'next/link'
import { notFound } from 'next/navigation'

interface GameDetails {
  id: string
  hockeytechId: number
  date: string
  location: string
  homeTeam: string
  awayTeam: string
  role: string
}

interface OfficialDetails {
  id: string
  name: string
  totalGames: number
  refereeGames: number
  linespersonGames: number
  games: GameDetails[]
}

async function getOfficial(id: string): Promise<OfficialDetails> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/officials/${id}`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch official')
  }

  return res.json()
}

export default async function OfficialPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const official = await getOfficial(id)

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline mb-6"
        >
          ← Back to Officials
        </Link>

        <div className="bg-black rounded-lg shadow p-6 mb-8">
          <h1 className="text-5xl font-[zuume] font-bold italic text-white mb-4">{official.name}</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0b4000] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">Total Games</div>
              <div className="text-4xl font-black italic text-green-400">{official.totalGames}</div>
            </div>
            <div className="bg-[#4d3200] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">As Referee</div>
              <div className="text-4xl font-black italic text-orange-400">{official.refereeGames}</div>
            </div>
            <div className="bg-[#002d4d] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">As Linesperson</div>
              <div className="text-4xl font-black italic text-blue-400">
                {official.linespersonGames}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Game History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-200">
              {official.games.map((game: GameDetails) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(game.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {game.awayTeam} @ {game.homeTeam}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{game.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        game.role === 'referee'
                          ? 'bg-[#4d3200] text-orange-400'
                          : 'bg-[#002d4d] text-blue-400'
                      }`}
                    >
                      {game.role === 'referee' ? 'Referee' : 'Linesperson'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    <a
                      href={`https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=bchl&game_id=${game.hockeytechId}&lang_id=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View Report
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
