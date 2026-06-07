import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team') || null
    const startDate = searchParams.get('startDate') || null
    const endDate = searchParams.get('endDate') || null

    // Build game filter
    const gameWhere: Record<string, unknown> = {}

    if (startDate || endDate) {
      gameWhere.date = {}
      if (startDate) (gameWhere.date as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        ;(gameWhere.date as Record<string, unknown>).lte = end
      }
    }

    if (team) {
      gameWhere.OR = [
        { homeTeam: { name: team } },
        { awayTeam: { name: team } }
      ]
    }

    // Fetch matching games with officials and penalties
    const games = await prisma.game.findMany({
      where: gameWhere,
      select: {
        id: true,
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

    const gameCount = games.length

    // Penalty stats
    let totalPIM = 0
    let minors = 0
    let majors = 0
    let matches = 0
    let misconducts = 0
    let gameMisconducts = 0
    let fights = 0
    let instigators = 0
    let aggressors = 0
    let faceoffViolations = 0
    const penaltyCounts: Record<string, number> = {}
    const penaltyMinutes: Record<string, number> = {}

    for (const game of games) {
      for (const p of game.penalties) {
        const off = p.offence.toLowerCase()

        // Use authoritative minute values per penalty type — game sheets often
        // record misconducts and game misconducts as 0:00 because the team
        // doesn't go short-handed, but they still count toward PIM.
        let pimMinutes: number
        if (off.includes('game misconduct')) {
          gameMisconducts++
          pimMinutes = 10
        } else if (off.includes('misconduct')) {
          misconducts++
          pimMinutes = 10
        } else if (off === 'match' || off.startsWith('match ')) {
          matches++
          pimMinutes = 5
        } else if (off.includes('fighting')) {
          fights++
          pimMinutes = 5
        } else if (p.minutes === 5) {
          majors++
          pimMinutes = 5
        } else {
          minors++
          pimMinutes = 2
        }

        if (off.includes('instigator')) instigators++
        if (off.includes('aggressor')) aggressors++
        if (off.includes('face-off violation') || off.includes('faceoff violation')) faceoffViolations++

        totalPIM += pimMinutes
        penaltyCounts[p.offence] = (penaltyCounts[p.offence] || 0) + 1
        penaltyMinutes[p.offence] = (penaltyMinutes[p.offence] || 0) + pimMinutes
      }
    }

    const topPenalties = Object.entries(penaltyCounts)
      .map(([offence, count]) => ({ offence, count, pim: penaltyMinutes[offence] }))
      .sort((a, b) => b.count - a.count)

    // Top officials
    const refCounts: Record<string, { name: string; games: number }> = {}
    const linesCounts: Record<string, { name: string; games: number }> = {}

    for (const game of games) {
      for (const o of game.officials) {
        const map = o.role === 'referee' ? refCounts : linesCounts
        if (!map[o.officialId]) map[o.officialId] = { name: o.official.name, games: 0 }
        map[o.officialId].games++
      }
    }

    const topReferees = Object.entries(refCounts)
      .map(([id, data]) => ({ id, name: data.name, games: data.games }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)

    const topLinespeople = Object.entries(linesCounts)
      .map(([id, data]) => ({ id, name: data.name, games: data.games }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)

    return NextResponse.json({
      gameCount,
      penaltyStats: {
        totalPIM, minors, majors, matches, misconducts,
        gameMisconducts, fights, instigators, aggressors,
        faceoffViolations, topPenalties
      },
      topReferees,
      topLinespeople
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
