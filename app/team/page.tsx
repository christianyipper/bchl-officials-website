import { headers } from 'next/headers'
import OfficialsPageClient from '../components/OfficialsPageClient'

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

async function getBaseUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

async function getOfficials(season?: string): Promise<OfficialSummary[]> {
  const baseUrl = await getBaseUrl()
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
  const baseUrl = await getBaseUrl()
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
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-8xl text-white">Officiating Team</h1>
          <p className="text-white font-bold uppercase">On-ice officiating stats</p>
        </div>

        <OfficialsPageClient officials={officials} seasons={seasons} currentSeason={season} />
      </div>
    </main>
  )
}
