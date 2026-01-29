import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type OfficialWithGames = Prisma.OfficialGetPayload<{
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

type GameOfficialWithRelations = NonNullable<OfficialWithGames['games'][number]>

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const official = await prisma.official.findUnique({
      where: { id },
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
          orderBy: {
            game: {
              date: 'desc'
            }
          }
        }
      }
    })

    if (!official) {
      return NextResponse.json(
        { error: 'Official not found' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedOfficial = {
      id: official.id,
      name: official.name,
      totalGames: official.games.length,
      refereeGames: official.games.filter(g => g.role === 'referee').length,
      linespersonGames: official.games.filter(g => g.role === 'linesperson').length,
      games: official.games.map((gameOfficial: GameOfficialWithRelations) => ({
        id: gameOfficial.game.id,
        hockeytechId: gameOfficial.game.hockeytechId,
        date: gameOfficial.game.date,
        location: gameOfficial.game.location,
        homeTeam: gameOfficial.game.homeTeam.name,
        awayTeam: gameOfficial.game.awayTeam.name,
        role: gameOfficial.role
      }))
    }

    return NextResponse.json(formattedOfficial)
  } catch (error) {
    console.error('Error fetching official:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
