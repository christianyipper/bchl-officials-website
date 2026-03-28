import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const team = searchParams.get('team')

  const where: Record<string, unknown> = {}
  if (startDate || endDate) {
    where.date = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate + 'T23:59:59Z') })
    }
  }
  if (team) {
    where.OR = [
      { homeTeam: { name: team } },
      { awayTeam: { name: team } }
    ]
  }

  const games = await prisma.game.findMany({
    where,
    include: {
      homeTeam: true,
      awayTeam: true,
      officials: { include: { official: true } }
    },
    orderBy: { date: 'desc' },
    take: 100
  })

  return NextResponse.json(games.map(game => ({
    id: game.id,
    date: game.date,
    homeTeam: game.homeTeam.name,
    awayTeam: game.awayTeam.name,
    officials: game.officials.map(o => ({
      id: o.id,
      officialId: o.officialId,
      name: o.official.name,
      role: o.role
    }))
  })))
}
