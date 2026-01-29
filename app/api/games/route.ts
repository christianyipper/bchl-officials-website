import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        officials: {
          include: {
            official: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Format the response
    const formattedGames = games.map(game => ({
      id: game.id,
      hockeytechId: game.hockeytechId,
      date: game.date,
      location: game.location,
      homeTeam: game.homeTeam.name,
      awayTeam: game.awayTeam.name,
      referees: game.officials
        .filter(o => o.role === 'referee')
        .map(o => ({ id: o.official.id, name: o.official.name })),
      linespeople: game.officials
        .filter(o => o.role === 'linesperson')
        .map(o => ({ id: o.official.id, name: o.official.name }))
    }))

    return NextResponse.json(formattedGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
