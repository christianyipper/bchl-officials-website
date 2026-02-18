import { prisma } from '@/lib/prisma'
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

async function getOfficials(season?: string): Promise<OfficialSummary[]> {
  const officials = await prisma.official.findMany({
    include: {
      games: {
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          }
        },
        ...(season && {
          where: {
            game: {
              season: season
            }
          }
        })
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  const activeStatusMap = new Map<string, boolean>()
  for (const official of officials) {
    const currentSeasonCount = await prisma.gameOfficial.count({
      where: {
        officialId: official.id,
        game: {
          season: '2025-26'
        }
      }
    })
    activeStatusMap.set(official.id, currentSeasonCount > 0)
  }

  return officials.map((official) => ({
    id: official.id,
    name: official.name,
    totalGames: official.games.length,
    refereeGames: official.games.filter(g => g.role === 'referee').length,
    linespersonGames: official.games.filter(g => g.role === 'linesperson').length,
    isActive: activeStatusMap.get(official.id) || false,
    isOriginal57: official.original57 === 1,
    isAhl: official.ahl === 1,
    isEchl: official.echl === 1,
    isPwhl: official.pwhl === 1
  }))
}

async function getSeasons(): Promise<string[]> {
  const games = await prisma.game.findMany({
    select: { season: true }
  })
  return [...new Set(games.map(g => g.season))].sort().reverse()
}

export default async function Team({
  searchParams,
}: {
  searchParams: Promise<{ season?: string }>
}) {
  const params = await searchParams
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
