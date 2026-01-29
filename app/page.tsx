import Link from 'next/link'
import OfficialsTable from './components/OfficialsTable'
import SeasonTabs from './components/SeasonTabs'

interface OfficialSummary {
  id: string
  name: string
  totalGames: number
  refereeGames: number
  linespersonGames: number
}

async function getOfficials(season?: string): Promise<OfficialSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = season
    ? `${baseUrl}/api/officials?season=${season}`
    : `${baseUrl}/api/officials`

  const res = await fetch(url, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch officials')
  }

  return res.json()
}

async function getSeasons(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/seasons`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    return []
  }

  return res.json()
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const params = await searchParams
  const season = params.season
  const officials = await getOfficials(season)
  const seasons = await getSeasons()

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">BCHL Officials Tracker</h1>
          <p className="text-white">Track officials and their game assignments</p>
        </div>

        <nav className="mb-8 flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-orange-600 text-white font-black uppercase text-sm hover:bg-orange-700 transition-colors"
          >
            Officials
          </Link>
          <Link
            href="/games"
            className="px-4 py-2 bg-[#1E1E1E] text-white font-black uppercase text-sm hover:bg-orange-600 transition-colors"
          >
            Games
          </Link>
        </nav>

        <SeasonTabs seasons={seasons} currentSeason={season} />

        <OfficialsTable officials={officials} />
      </div>
    </main>
  )
}
