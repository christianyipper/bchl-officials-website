import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const season = searchParams.get('season')

    if (!season) {
      return NextResponse.json({ error: 'season is required' }, { status: 400 })
    }

    const games = await prisma.game.findMany({
      where: season === 'all' ? {} : { season },
      select: {
        hockeytechId: true,
        date: true,
        duration: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        officials: {
          select: {
            officialId: true,
            role: true,
            official: { select: { name: true } }
          }
        },
        penalties: {
          select: { minutes: true, offence: true }
        }
      }
    })

    // Per-official penalty counts across all games they worked that season
    const officialMeta: Record<string, { name: string }> = {}
    const officialCats: Record<string, {
      minors: number; majors: number; matches: number; misconducts: number
      gameMisconducts: number; fights: number; instigators: number
      aggressors: number; faceoffViolations: number
    }> = {}

    for (const game of games) {
      for (const o of game.officials) {
        if (!officialCats[o.officialId]) {
          officialMeta[o.officialId] = { name: o.official.name }
          officialCats[o.officialId] = {
            minors: 0, majors: 0, matches: 0, misconducts: 0,
            gameMisconducts: 0, fights: 0, instigators: 0,
            aggressors: 0, faceoffViolations: 0
          }
        }
        for (const p of game.penalties) {
          const off = p.offence.toLowerCase()
          const cats = officialCats[o.officialId]
          if (off.includes('fighting')) cats.fights++
          else if (off === 'match' || off.startsWith('match ')) cats.matches++
          else if (off.includes('game misconduct')) cats.gameMisconducts++
          else if (off.includes('misconduct')) cats.misconducts++
          else if (p.minutes === 5) cats.majors++
          else if (p.minutes === 2) cats.minors++
          if (off.includes('instigator')) cats.instigators++
          if (off.includes('aggressor')) cats.aggressors++
          if (off.includes('face-off violation') || off.includes('faceoff violation')) cats.faceoffViolations++
        }
      }
    }

    const categoryKeys = ['minors', 'majors', 'matches', 'misconducts', 'gameMisconducts', 'fights', 'instigators', 'aggressors', 'faceoffViolations'] as const

    const penaltyLeaders: Record<string, { id: string; name: string; count: number }[]> = {}
    for (const key of categoryKeys) {
      penaltyLeaders[key] = Object.entries(officialCats)
        .map(([id, cats]) => ({ id, name: officialMeta[id].name, count: cats[key] }))
        .filter(o => o.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
    }

    // Top 10 longest / shortest games with officials
    const gamesWithDuration = games
      .filter(g => g.duration != null && g.duration > 0)
      .map(g => ({
        hockeytechId: g.hockeytechId,
        date: g.date.toISOString(),
        duration: g.duration as number,
        homeTeam: g.homeTeam.name,
        awayTeam: g.awayTeam.name,
        officials: g.officials
          .filter(o => o.official.name !== '-')
          .map(o => ({ id: o.officialId, name: o.official.name, role: o.role }))
      }))

    const longestGames = [...gamesWithDuration].sort((a, b) => b.duration - a.duration).slice(0, 10)
    const shortestGames = [...gamesWithDuration].sort((a, b) => a.duration - b.duration).slice(0, 10)

    return NextResponse.json({ penaltyLeaders, longestGames, shortestGames })
  } catch (error) {
    console.error('Error fetching season stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
