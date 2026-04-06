import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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
    const season = searchParams.get('season') || null

    // Season filter condition reused across queries
    const seasonFilter = season ? { game: { season } } : {}

    // First, get the official
    const official = await prisma.official.findUnique({
      where: { id }
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
        officialId: id,
        ...seasonFilter
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

    // Get role counts (filtered by season)
    const refereeGames = await prisma.gameOfficial.count({
      where: {
        officialId: id,
        role: 'referee',
        ...seasonFilter
      }
    })

    const linespersonGames = await prisma.gameOfficial.count({
      where: {
        officialId: id,
        role: 'linesperson',
        ...seasonFilter
      }
    })

    // Total games for this official (filtered by season)
    const totalGames = refereeGames + linespersonGames

    // Build games timeline (for sparkline graphs)
    const timelineGames = await prisma.gameOfficial.findMany({
      where: { officialId: id, ...seasonFilter },
      select: { role: true, game: { select: { date: true } } }
    })

    let gamesTimeline: { period: string; total: number; referee: number; linesperson: number }[]
    let useWeekly = false

    if (season) {
      // Per-season: group by week
      useWeekly = true
      const weekMap: Record<string, { total: number; referee: number; linesperson: number }> = {}
      for (const tg of timelineGames) {
        const d = tg.game.date
        const jan4 = new Date(d.getFullYear(), 0, 4)
        const dayNum = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000) + jan4.getDay() + 1)
        const weekNum = Math.ceil(dayNum / 7)
        const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
        if (!weekMap[key]) weekMap[key] = { total: 0, referee: 0, linesperson: 0 }
        weekMap[key].total++
        if (tg.role === 'referee') weekMap[key].referee++
        else weekMap[key].linesperson++
      }
      // Fill gaps between first and last week
      const weekKeys = Object.keys(weekMap).sort()
      const allWeeks: string[] = []
      if (weekKeys.length >= 2) {
        let [curYear, curWeek] = weekKeys[0].split('-W').map(Number)
        const [endYear, endWeek] = weekKeys[weekKeys.length - 1].split('-W').map(Number)
        while (curYear < endYear || (curYear === endYear && curWeek <= endWeek)) {
          allWeeks.push(`${curYear}-W${String(curWeek).padStart(2, '0')}`)
          curWeek++
          if (curWeek > 52) { curWeek = 1; curYear++ }
        }
      } else {
        allWeeks.push(...weekKeys)
      }
      gamesTimeline = allWeeks.map(period => ({
        period,
        total: weekMap[period]?.total || 0,
        referee: weekMap[period]?.referee || 0,
        linesperson: weekMap[period]?.linesperson || 0
      }))
    } else {
      // All time: group by month
      const monthMap: Record<string, { total: number; referee: number; linesperson: number }> = {}
      for (const tg of timelineGames) {
        const d = tg.game.date
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!monthMap[key]) monthMap[key] = { total: 0, referee: 0, linesperson: 0 }
        monthMap[key].total++
        if (tg.role === 'referee') monthMap[key].referee++
        else monthMap[key].linesperson++
      }
      // Fill gaps between first and last month
      const monthKeys = Object.keys(monthMap).sort()
      const allMonths: string[] = []
      if (monthKeys.length >= 2) {
        let [curYear, curMonth] = monthKeys[0].split('-').map(Number)
        const [endYear, endMonth] = monthKeys[monthKeys.length - 1].split('-').map(Number)
        while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
          allMonths.push(`${curYear}-${String(curMonth).padStart(2, '0')}`)
          curMonth++
          if (curMonth > 12) { curMonth = 1; curYear++ }
        }
      } else {
        allMonths.push(...monthKeys)
      }
      gamesTimeline = allMonths.map(period => ({
        period,
        total: monthMap[period]?.total || 0,
        referee: monthMap[period]?.referee || 0,
        linesperson: monthMap[period]?.linesperson || 0
      }))
    }

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

    const totalPages = Math.ceil(totalGames / limit)

    // Get all seasons this official has games in
    const officialSeasonGames = await prisma.gameOfficial.findMany({
      where: { officialId: id },
      select: { game: { select: { season: true } } },
      distinct: ['gameId']
    })
    const activeSeasons = [...new Set(officialSeasonGames.map(go => go.game.season))].sort()
    const isActive = activeSeasons.includes('2025-26')

    // Calculate ranks using efficient count queries
    // Rank = number of officials with MORE games + 1
    let totalGamesRank: number | null = null
    let refereeGamesRank: number | null = null
    let linespersonGamesRank: number | null = null

    try {
      const seasonJoin = season
        ? Prisma.sql`JOIN "Game" g2 ON go."gameId" = g2.id`
        : Prisma.empty
      const seasonWhere = season
        ? Prisma.sql`g2.season = ${season}`
        : Prisma.empty

      if (totalGames > 0) {
        const whereClause = season
          ? Prisma.sql`WHERE ${seasonWhere}`
          : Prisma.empty
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT go."officialId"
            FROM "GameOfficial" go
            ${seasonJoin}
            ${whereClause}
            GROUP BY go."officialId"
            HAVING COUNT(*) > ${totalGames}
          ) as officials_with_more
        `
        totalGamesRank = Number(result[0]?.count ?? 0) + 1
      }

      if (refereeGames > 0) {
        const whereClause = season
          ? Prisma.sql`WHERE ${seasonWhere} AND go.role = 'referee'`
          : Prisma.sql`WHERE go.role = 'referee'`
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT go."officialId"
            FROM "GameOfficial" go
            ${seasonJoin}
            ${whereClause}
            GROUP BY go."officialId"
            HAVING COUNT(*) > ${refereeGames}
          ) as officials_with_more
        `
        refereeGamesRank = Number(result[0]?.count ?? 0) + 1
      }

      if (linespersonGames > 0) {
        const whereClause = season
          ? Prisma.sql`WHERE ${seasonWhere} AND go.role = 'linesperson'`
          : Prisma.sql`WHERE go.role = 'linesperson'`
        const result = await prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM (
            SELECT go."officialId"
            FROM "GameOfficial" go
            ${seasonJoin}
            ${whereClause}
            GROUP BY go."officialId"
            HAVING COUNT(*) > ${linespersonGames}
          ) as officials_with_more
        `
        linespersonGamesRank = Number(result[0]?.count ?? 0) + 1
      }
    } catch (rankError) {
      console.error('Error calculating ranks:', rankError)
    }

    // Get game duration stats (avg, longest, shortest)
    let gameDurationStats: {
      avgDuration: number | null
      longestGame: { duration: number; date: string; homeTeam: string; awayTeam: string; hockeytechId: number } | null
      shortestGame: { duration: number; date: string; homeTeam: string; awayTeam: string; hockeytechId: number } | null
    } = { avgDuration: null, longestGame: null, shortestGame: null }

    try {
      const seasonDurationFilter = season
        ? Prisma.sql` AND g.season = ${season}`
        : Prisma.empty

      const avgResult = await prisma.$queryRaw<{ avg: number | null }[]>`
        SELECT AVG(g.duration)::float as avg
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL${seasonDurationFilter}
      `
      const avg = avgResult[0]?.avg ?? null

      const longestResult = await prisma.$queryRaw<{ duration: number; date: Date; home: string; away: string; hockeytechId: number }[]>`
        SELECT g.duration, g.date, ht.name as home, at.name as away, g."hockeytechId"
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        JOIN "Team" ht ON g."homeTeamId" = ht.id
        JOIN "Team" at ON g."awayTeamId" = at.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL${seasonDurationFilter}
        ORDER BY g.duration DESC
        LIMIT 1
      `

      const shortestResult = await prisma.$queryRaw<{ duration: number; date: Date; home: string; away: string; hockeytechId: number }[]>`
        SELECT g.duration, g.date, ht.name as home, at.name as away, g."hockeytechId"
        FROM "GameOfficial" go
        JOIN "Game" g ON go."gameId" = g.id
        JOIN "Team" ht ON g."homeTeamId" = ht.id
        JOIN "Team" at ON g."awayTeamId" = at.id
        WHERE go."officialId" = ${id} AND g.duration IS NOT NULL${seasonDurationFilter}
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
    let topTeams: { name: string; count: number; pim: number; topPenalties: { offence: string; count: number }[] }[] = []
    try {
      const officialGames = await prisma.gameOfficial.findMany({
        where: { officialId: id, ...seasonFilter },
        select: {
          game: {
            select: {
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
              penalties: { select: { minutes: true, side: true, offence: true } }
            }
          }
        }
      })

      const teamCounts: Record<string, number> = {}
      const teamPIM: Record<string, number> = {}
      const teamPenaltyCounts: Record<string, Record<string, number>> = {}
      for (const go of officialGames) {
        const home = go.game.homeTeam.name
        const away = go.game.awayTeam.name
        teamCounts[home] = (teamCounts[home] || 0) + 1
        teamCounts[away] = (teamCounts[away] || 0) + 1
        for (const p of go.game.penalties) {
          if (p.side === 'home') {
            teamPIM[home] = (teamPIM[home] || 0) + p.minutes
            if (!teamPenaltyCounts[home]) teamPenaltyCounts[home] = {}
            teamPenaltyCounts[home][p.offence] = (teamPenaltyCounts[home][p.offence] || 0) + 1
          } else if (p.side === 'away') {
            teamPIM[away] = (teamPIM[away] || 0) + p.minutes
            if (!teamPenaltyCounts[away]) teamPenaltyCounts[away] = {}
            teamPenaltyCounts[away][p.offence] = (teamPenaltyCounts[away][p.offence] || 0) + 1
          }
        }
      }

      topTeams = Object.entries(teamCounts)
        .map(([name, count]) => ({
          name,
          count,
          pim: teamPIM[name] || 0,
          topPenalties: Object.entries(teamPenaltyCounts[name] || {})
            .map(([offence, cnt]) => ({ offence, count: cnt }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
        }))
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
      gameMisconducts: number
      fights: number
      instigators: number
      aggressors: number
      faceoffViolations: number
      minorsRank: number | null
      majorsRank: number | null
      matchesRank: number | null
      misconductsRank: number | null
      gameMisconductsRank: number | null
      fightsRank: number | null
      instigatorsRank: number | null
      aggressorsRank: number | null
      faceoffViolationsRank: number | null
      topPenalties: { offence: string; count: number }[]
    } = {
      totalPIM: 0,
      minors: 0,
      majors: 0,
      matches: 0,
      misconducts: 0,
      gameMisconducts: 0,
      fights: 0,
      instigators: 0,
      aggressors: 0,
      faceoffViolations: 0,
      minorsRank: null,
      majorsRank: null,
      matchesRank: null,
      misconductsRank: null,
      gameMisconductsRank: null,
      fightsRank: null,
      instigatorsRank: null,
      aggressorsRank: null,
      faceoffViolationsRank: null,
      topPenalties: []
    }
    try {
      // Get all game IDs where this official was involved (filtered by season)
      const allGameOfficials = await prisma.gameOfficial.findMany({
        where: { officialId: id, ...seasonFilter },
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
          } else if (off.includes('game misconduct')) {
            penaltyStats.gameMisconducts++
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

        // Calculate ranks for each penalty category (filtered by season)
        const allOfficials = await prisma.gameOfficial.findMany({
          where: seasonFilter,
          select: { officialId: true, gameId: true }
        })
        const officialGameMap: Record<string, Set<string>> = {}
        for (const go of allOfficials) {
          if (!officialGameMap[go.officialId]) officialGameMap[go.officialId] = new Set()
          officialGameMap[go.officialId].add(go.gameId)
        }

        // Get all game IDs in the season for penalty lookup
        const allSeasonGameIds = new Set<string>()
        for (const gameIds of Object.values(officialGameMap)) {
          for (const gid of gameIds) allSeasonGameIds.add(gid)
        }

        const allPenalties = await prisma.penalty.findMany({
          where: { gameId: { in: [...allSeasonGameIds] } },
          select: { gameId: true, minutes: true, offence: true }
        })

        // Build per-official category counts
        const officialCategories: Record<string, {
          minors: number; majors: number; matches: number; misconducts: number; gameMisconducts: number
          fights: number; instigators: number; aggressors: number; faceoffViolations: number
        }> = {}

        // Index penalties by gameId for fast lookup
        const penaltiesByGame: Record<string, typeof allPenalties> = {}
        for (const p of allPenalties) {
          if (!penaltiesByGame[p.gameId]) penaltiesByGame[p.gameId] = []
          penaltiesByGame[p.gameId].push(p)
        }

        for (const [offId, gameIds] of Object.entries(officialGameMap)) {
          const cats = { minors: 0, majors: 0, matches: 0, misconducts: 0, gameMisconducts: 0, fights: 0, instigators: 0, aggressors: 0, faceoffViolations: 0 }
          for (const gid of gameIds) {
            const gamePens = penaltiesByGame[gid]
            if (!gamePens) continue
            for (const p of gamePens) {
              const off = p.offence.toLowerCase()
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
          officialCategories[offId] = cats
        }

        // Rank = number of officials with MORE in that category + 1
        const myCats = officialCategories[id] || penaltyStats
        const categoryKeys = ['minors', 'majors', 'matches', 'misconducts', 'gameMisconducts', 'fights', 'instigators', 'aggressors', 'faceoffViolations'] as const
        for (const key of categoryKeys) {
          const myVal = myCats[key]
          if (myVal > 0) {
            let higher = 0
            for (const [offId, cats] of Object.entries(officialCategories)) {
              if (offId !== id && cats[key] > myVal) higher++
            }
            const rankKey = `${key}Rank` as keyof typeof penaltyStats
            ;(penaltyStats as Record<string, unknown>)[rankKey] = higher + 1
          }
        }
      }
    } catch (penaltyError) {
      console.error('Error fetching penalty stats:', penaltyError)
    }

    // Team chemistry: top co-officials by role with timelines
    let teamChemistry: {
      topReferees: { id: string; name: string; games: number; timeline: number[] }[]
      topLinespeople: { id: string; name: string; games: number; timeline: number[] }[]
      periods: string[]
    } = { topReferees: [], topLinespeople: [], periods: [] }

    try {
      // Get all game IDs for this official (filtered by season)
      const myGameOfficials = await prisma.gameOfficial.findMany({
        where: { officialId: id, ...seasonFilter },
        select: { gameId: true }
      })
      const myGameIds = myGameOfficials.map(go => go.gameId)

      if (myGameIds.length > 0) {
        // Find all co-officials on those games (excluding self), include game date for timelines
        const coOfficials = await prisma.gameOfficial.findMany({
          where: {
            gameId: { in: myGameIds },
            officialId: { not: id }
          },
          select: {
            officialId: true,
            role: true,
            official: { select: { name: true } },
            game: { select: { date: true } }
          }
        })

        // Group by officialId + role, also track dates per period
        const refCounts: Record<string, { name: string; count: number; periods: Record<string, number> }> = {}
        const linesCounts: Record<string, { name: string; count: number; periods: Record<string, number> }> = {}

        // Chemistry period grouping: by season for all-time, by week for per-season
        const getChemistryPeriodKey = (d: Date) => {
          if (season) {
            const jan4 = new Date(d.getFullYear(), 0, 4)
            const dayNum = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000) + jan4.getDay() + 1)
            const weekNum = Math.ceil(dayNum / 7)
            return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
          }
          // All-time: group by season (Sep+ = current year to next year)
          const month = d.getMonth()
          const year = d.getFullYear()
          if (month >= 8) { // Sep or later
            return `${year}-${String(year + 1).slice(2)}`
          }
          return `${year - 1}-${String(year).slice(2)}`
        }

        for (const co of coOfficials) {
          const map = co.role === 'referee' ? refCounts : linesCounts
          if (!map[co.officialId]) {
            map[co.officialId] = { name: co.official.name, count: 0, periods: {} }
          }
          map[co.officialId].count++
          const period = getChemistryPeriodKey(co.game.date)
          map[co.officialId].periods[period] = (map[co.officialId].periods[period] || 0) + 1
        }

        // Build chemistry periods: by season for all-time, by week for per-season
        let chemistryPeriods: string[]
        if (season) {
          chemistryPeriods = gamesTimeline.map(t => t.period)
        } else {
          // Collect all distinct season keys from co-official data
          const seasonSet = new Set<string>()
          for (const data of Object.values(refCounts)) {
            for (const p of Object.keys(data.periods)) seasonSet.add(p)
          }
          for (const data of Object.values(linesCounts)) {
            for (const p of Object.keys(data.periods)) seasonSet.add(p)
          }
          const sortedSeasons = [...seasonSet].sort()
          // Fill gaps between first and last season
          chemistryPeriods = []
          if (sortedSeasons.length >= 2) {
            let startYear = parseInt(sortedSeasons[0].split('-')[0], 10)
            const endYear = parseInt(sortedSeasons[sortedSeasons.length - 1].split('-')[0], 10)
            while (startYear <= endYear) {
              chemistryPeriods.push(`${startYear}-${String(startYear + 1).slice(2)}`)
              startYear++
            }
          } else {
            chemistryPeriods = sortedSeasons
          }
        }

        teamChemistry.periods = chemistryPeriods

        const buildTop = (counts: typeof refCounts) =>
          Object.entries(counts)
            .map(([coId, data]) => ({
              id: coId,
              name: data.name,
              games: data.count,
              timeline: chemistryPeriods.map(p => data.periods[p] || 0)
            }))
            .sort((a, b) => b.games - a.games)
            .slice(0, 5)

        teamChemistry.topReferees = buildTop(refCounts)
        teamChemistry.topLinespeople = buildTop(linesCounts)
      }
    } catch (chemistryError) {
      console.error('Error fetching team chemistry:', chemistryError)
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
      activeSeasons,
      isOriginal57: official.original57 === 1,
      isAhl: official.ahl === 1,
      isEchl: official.echl === 1,
      isPwhl: official.pwhl === 1,
      topTeams,
      gameDurationStats,
      penaltyStats,
      teamChemistry,
      gamesTimeline,
      useWeekly,
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
