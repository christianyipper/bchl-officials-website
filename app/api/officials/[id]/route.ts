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
            awayTeam: true
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
      role: gameOfficial.role
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

    // Get top most officiated teams
    let topTeams: { name: string; count: bigint }[] = []
    try {
      topTeams = await prisma.$queryRaw<{ name: string; count: bigint }[]>`
        SELECT t.name, COUNT(*) as count FROM (
          SELECT g."homeTeamId" as "teamId" FROM "GameOfficial" go
          JOIN "Game" g ON go."gameId" = g.id
          WHERE go."officialId" = ${id}
          UNION ALL
          SELECT g."awayTeamId" as "teamId" FROM "GameOfficial" go
          JOIN "Game" g ON go."gameId" = g.id
          WHERE go."officialId" = ${id}
        ) sub
        JOIN "Team" t ON sub."teamId" = t.id
        GROUP BY t.name
        ORDER BY count DESC
      `
    } catch (topTeamsError) {
      console.error('Error fetching top teams:', topTeamsError)
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
      topTeams: topTeams.map(t => ({ name: t.name, count: Number(t.count) })),
      gameDurationStats,
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
