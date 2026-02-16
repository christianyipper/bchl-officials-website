import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // First, get the official with game counts
    const official = await prisma.official.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            games: true
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

    // Get paginated games
    const gameOfficials = await prisma.gameOfficial.findMany({
      where: {
        officialId: id
      },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
            penalties: {
              select: { minutes: true, side: true }
            }
          }
        }
      },
      orderBy: {
        game: {
          date: 'desc'
        }
      },
      skip,
      take: limit
    })

    // Get role counts
    const refereeGames = await prisma.gameOfficial.count({
      where: {
        officialId: id,
        role: 'referee'
      }
    })

    const linespersonGames = await prisma.gameOfficial.count({
      where: {
        officialId: id,
        role: 'linesperson'
      }
    })

    // Transform the data to match the expected format
    const games = gameOfficials.map(gameOfficial => ({
      id: gameOfficial.game.id,
      hockeytechId: gameOfficial.game.hockeytechId,
      date: gameOfficial.game.date.toISOString(),
      location: gameOfficial.game.location,
      homeTeam: gameOfficial.game.homeTeam.name,
      awayTeam: gameOfficial.game.awayTeam.name,
      role: gameOfficial.role,
      duration: gameOfficial.game.duration,
      homePIM: gameOfficial.game.penalties.filter(p => p.side === 'home').reduce((sum, p) => sum + p.minutes, 0),
      awayPIM: gameOfficial.game.penalties.filter(p => p.side === 'away').reduce((sum, p) => sum + p.minutes, 0)
    }))

    const totalGames = official._count.games
    const totalPages = Math.ceil(totalGames / limit)

    // Check if official is active (has games in current season: 2025-26)
    const currentSeasonGames = await prisma.gameOfficial.count({
      where: {
        officialId: id,
        game: {
          season: '2025-26'
        }
      }
    })
    const isActive = currentSeasonGames > 0

    // Calculate ranks using efficient count queries
    // Rank = number of officials with MORE games + 1
    let totalGamesRank: number | null = null
    let refereeGamesRank: number | null = null
    let linespersonGamesRank: number | null = null

    try {
      if (totalGames > 0) {
        // Count officials with more total games
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT "officialId"
            FROM "GameOfficial"
            GROUP BY "officialId"
            HAVING COUNT(*) > ${totalGames}
          ) as officials_with_more
        `
        totalGamesRank = Number(result[0]?.count ?? 0) + 1
      }

      if (refereeGames > 0) {
        // Count officials with more referee games
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT "officialId"
            FROM "GameOfficial"
            WHERE role = 'referee'
            GROUP BY "officialId"
            HAVING COUNT(*) > ${refereeGames}
          ) as officials_with_more
        `
        refereeGamesRank = Number(result[0]?.count ?? 0) + 1
      }

      if (linespersonGames > 0) {
        // Count officials with more linesperson games
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT "officialId"
            FROM "GameOfficial"
            WHERE role = 'linesperson'
            GROUP BY "officialId"
            HAVING COUNT(*) > ${linespersonGames}
          ) as officials_with_more
        `
        linespersonGamesRank = Number(result[0]?.count ?? 0) + 1
      }
    } catch (rankError) {
      console.error('Error calculating ranks:', rankError)
      // Ranks will remain null if calculation fails
    }

    // Get game duration stats (avg, longest, shortest)
    let gameDurationStats: {
      avgDuration: number | null
      longestGame: { duration: number; date: string; homeTeam: string; awayTeam: string; hockeytechId: number } | null
      shortestGame: { duration: number; date: string; homeTeam: string; awayTeam: string; hockeytechId: number } | null
    } = { avgDuration: null, longestGame: null, shortestGame: null }

    try {
      const avgResult = await prisma.$queryRaw<{ avg: number | null }[]>`
        SELECT AVG(g.duration)::float as avg
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL
      `
      const avg = avgResult[0]?.avg ?? null

      const longestResult = await prisma.$queryRaw<{ duration: number; date: Date; home: string; away: string; hockeytechId: number }[]>`
        SELECT g.duration, g.date, ht.name as home, at.name as away, g."hockeytechId"
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        JOIN "Team" ht ON g."homeTeamId" = ht.id
        JOIN "Team" at ON g."awayTeamId" = at.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL
        ORDER BY g.duration DESC
        LIMIT 1
      `

      const shortestResult = await prisma.$queryRaw<{ duration: number; date: Date; home: string; away: string; hockeytechId: number }[]>`
        SELECT g.duration, g.date, ht.name as home, at.name as away, g."hockeytechId"
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        JOIN "Team" ht ON g."homeTeamId" = ht.id
        JOIN "Team" at ON g."awayTeamId" = at.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL
        ORDER BY g.duration ASC
        LIMIT 1
      `

      gameDurationStats = {
        avgDuration: avg ? Math.round(avg) : null,
        longestGame: longestResult[0] ? {
          duration: longestResult[0].duration,
          date: longestResult[0].date.toISOString(),
          homeTeam: longestResult[0].home,
          awayTeam: longestResult[0].away,
          hockeytechId: longestResult[0].hockeytechId
        } : null,
        shortestGame: shortestResult[0] ? {
          duration: shortestResult[0].duration,
          date: shortestResult[0].date.toISOString(),
          homeTeam: shortestResult[0].home,
          awayTeam: shortestResult[0].away,
          hockeytechId: shortestResult[0].hockeytechId
        } : null
      }
    } catch (durationError) {
      console.error('Error fetching duration stats:', durationError)
    }

    // Get top most officiated teams using Prisma ORM
    let topTeams: { name: string; count: number; pim: number }[] = []
    try {
      const officialGames = await prisma.gameOfficial.findMany({
        where: { officialId: id },
        select: {
          game: {
            select: {
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
              penalties: { select: { minutes: true, side: true } }
            }
          }
        }
      })

      const teamCounts: Record<string, number> = {}
      const teamPIM: Record<string, number> = {}
      for (const go of officialGames) {
        const home = go.game.homeTeam.name
        const away = go.game.awayTeam.name
        teamCounts[home] = (teamCounts[home] || 0) + 1
        teamCounts[away] = (teamCounts[away] || 0) + 1
        for (const p of go.game.penalties) {
          if (p.side === 'home') teamPIM[home] = (teamPIM[home] || 0) + p.minutes
          else if (p.side === 'away') teamPIM[away] = (teamPIM[away] || 0) + p.minutes
        }
      }

      topTeams = Object.entries(teamCounts)
        .map(([name, count]) => ({ name, count, pim: teamPIM[name] || 0 }))
        .sort((a, b) => b.count - a.count)
    } catch (topTeamsError) {
      console.error('Error fetching top teams:', topTeamsError)
    }

    // Get penalty stats for all games this official worked
    let penaltyStats: {
      totalPIM: number
      minors: number
      majors: number
      matches: number
      misconducts: number
      fights: number
      instigators: number
      aggressors: number
      faceoffViolations: number
      topPenalties: { offence: string; count: number }[]
    } = {
      totalPIM: 0,
      minors: 0,
      majors: 0,
      matches: 0,
      misconducts: 0,
      fights: 0,
      instigators: 0,
      aggressors: 0,
      faceoffViolations: 0,
      topPenalties: []
    }
    try {
      // Get all game IDs where this official was involved
      const allGameOfficials = await prisma.gameOfficial.findMany({
        where: { officialId: id },
        select: { gameId: true }
      })
      const allGameIds = allGameOfficials.map(go => go.gameId)

      if (allGameIds.length > 0) {
        // Get all penalties from those games
        const penalties = await prisma.penalty.findMany({
          where: { gameId: { in: allGameIds } },
          select: { minutes: true, offence: true }
        })

        // Calculate total PIM
        penaltyStats.totalPIM = penalties.reduce((sum, p) => sum + p.minutes, 0)

        // Calculate penalty type breakdowns
        for (const p of penalties) {
          const off = p.offence.toLowerCase()
          if (off.includes('fighting')) {
            penaltyStats.fights++
          } else if (off === 'match' || off.startsWith('match ')) {
            penaltyStats.matches++
          } else if (off.includes('misconduct')) {
            penaltyStats.misconducts++
          } else if (p.minutes === 5) {
            penaltyStats.majors++
          } else if (p.minutes === 2) {
            penaltyStats.minors++
          }
          if (off.includes('instigator')) {
            penaltyStats.instigators++
          }
          if (off.includes('aggressor')) {
            penaltyStats.aggressors++
          }
          if (off.includes('face-off violation') || off.includes('faceoff violation')) {
            penaltyStats.faceoffViolations++
          }
        }

        // Calculate all penalties by count (sorted descending)
        const penaltyCounts: Record<string, number> = {}
        for (const p of penalties) {
          penaltyCounts[p.offence] = (penaltyCounts[p.offence] || 0) + 1
        }
        penaltyStats.topPenalties = Object.entries(penaltyCounts)
          .map(([offence, count]) => ({ offence, count }))
          .sort((a, b) => b.count - a.count)
      }
    } catch (penaltyError) {
      console.error('Error fetching penalty stats:', penaltyError)
    }

    const response = {
      id: official.id,
      name: official.name,
      totalGames,
      refereeGames,
      linespersonGames,
      totalGamesRank,
      refereeGamesRank,
      linespersonGamesRank,
      isActive,
      isOriginal57: official.original57 === 1,
      isAhl: official.ahl === 1,
      isEchl: official.echl === 1,
      isPwhl: official.pwhl === 1,
      topTeams,
      gameDurationStats,
      penaltyStats,
      games,
      pagination: {
        page,
        limit,
        totalPages,
        totalGames
      }
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
