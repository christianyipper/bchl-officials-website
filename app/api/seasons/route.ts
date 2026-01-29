import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const seasons = await prisma.game.findMany({
      select: {
        season: true
      },
      distinct: ['season'],
      orderBy: {
        season: 'desc'
      }
    })

    return NextResponse.json(seasons.map(s => s.season))
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
