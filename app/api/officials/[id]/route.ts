import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
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

    // Transform the data to match the expected format
    const games = official.games.map(gameOfficial => ({
      id: gameOfficial.game.id,
      hockeytechId: gameOfficial.game.hockeytechId,
      date: gameOfficial.game.date.toISOString(),
      location: gameOfficial.game.location,
      homeTeam: gameOfficial.game.homeTeam.name,
      awayTeam: gameOfficial.game.awayTeam.name,
      role: gameOfficial.role
    }))

    const refereeGames = games.filter(g => g.role === 'referee').length
    const linespersonGames = games.filter(g => g.role === 'linesperson').length

    const response = {
      id: official.id,
      name: official.name,
      totalGames: games.length,
      refereeGames,
      linespersonGames,
      games
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching official:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
