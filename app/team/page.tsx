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

async function getOfficials(baseUrl: string, season?: string): Promise<OfficialSummary[]> {
  const url = season
    ? `${baseUrl}/api/officials?season=${season}`
    : `${baseUrl}/api/officials`

  const res = await fetch(url, {
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    throw new Error('Failed to fetch officials')
  }

  return res.json()
}

async function getSeasons(baseUrl: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/api/seasons`, {
    next: { revalidate: 300 }
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
  const season = params.season === 'all' ? undefined : (params.season || '2025-26')
  const baseUrl = await getBaseUrl()
  const officials = await getOfficials(baseUrl, season)
  const seasons = await getSeasons(baseUrl)

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
