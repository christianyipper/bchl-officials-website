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

    // Calculate game counts for each official
    const officialsWithCounts = officials.map((official: OfficialWithRelations) => ({
      id: official.id,
      name: official.name,
      totalGames: official.games.length,
      refereeGames: official.games.filter(g => g.role === 'referee').length,
      linespersonGames: official.games.filter(g => g.role === 'linesperson').length,
      isOriginal57: official.original57 === 1
    }))

    return NextResponse.json(officialsWithCounts)
  } catch (error) {
    console.error('Error fetching officials:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
