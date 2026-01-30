import OfficialsTable from '../components/OfficialsTable'
import SeasonTabs from '../components/SeasonTabs'

interface OfficialSummary {
  id: string
  name: string
  totalGames: number
  refereeGames: number
  linespersonGames: number
  isActive: boolean
  isOriginal57: boolean
  isAhl: boolean
  isEchl: boolean
  isPwhl: boolean
}

async function getOfficials(season?: string): Promise<OfficialSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = season
    ? `${baseUrl}/api/officials?season=${season}`
    : `${baseUrl}/api/officials`

  const res = await fetch(url, {
    next: { revalidate: 60 } // Cache for 60 seconds
  })

  if (!res.ok) {
    throw new Error('Failed to fetch officials')
  }

  return res.json()
}

async function getSeasons(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/seasons`, {
    next: { revalidate: 300 } // Cache for 5 minutes
  })

  if (!res.ok) {
    return []
  }

  return res.json()
}

export default async function Team({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const params = await searchParams
  // Default to 2025-26 season if no season parameter or if season is undefined
  const season = params.season === 'all' ? undefined : (params.season || '2025-26')
  const officials = await getOfficials(season)
  const seasons = await getSeasons()

  return (
    <main className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-[zuume] text-8xl font-bold italic text-white">Officiating Roster</h1>
          <p className="text-white font-bold uppercase">Track bchl officiating stats</p>
        </div>

        <SeasonTabs seasons={seasons} currentSeason={season} />

        <OfficialsTable officials={officials} />
      </div>
    </main>
  )
}
