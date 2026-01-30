import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type OfficialWithRelations = Prisma.OfficialGetPayload<{
  include: {
    games: {
      include: {
        game: {
          include: {
            homeTeam: true
            awayTeam: true
          }
        }
      }
    }
  }
}>

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')

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

    // Get active status for all officials (current season: 2025-26)
    // This is a separate query to ensure we always check against current season
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

    // Calculate game counts for each official
    const officialsWithCounts = officials.map((official: OfficialWithRelations) => {
      return {
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
      }
    })

    return NextResponse.json(officialsWithCounts)
  } catch (error) {
    console.error('Error fetching officials:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
