import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        season: true
      }
    })

    // Get unique seasons and sort descending
    const uniqueSeasons = [...new Set(games.map(g => g.season))].sort().reverse()

    return NextResponse.json(uniqueSeasons)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
