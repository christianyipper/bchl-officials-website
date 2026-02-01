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

    // Calculate ranks by comparing against all officials
    const allOfficials = await prisma.official.findMany({
      include: {
        _count: {
          select: {
            games: true
          }
        },
        games: {
          select: {
            role: true
          }
        }
      }
    })

    // Calculate counts for all officials
    const officialCounts = allOfficials.map(o => ({
      id: o.id,
      totalGames: o._count.games,
      refereeGames: o.games.filter(g => g.role === 'referee').length,
      linespersonGames: o.games.filter(g => g.role === 'linesperson').length
    }))

    // Sort and find ranks (only count officials with > 0 games for each category)
    const totalGamesRanked = officialCounts
      .filter(o => o.totalGames > 0)
      .sort((a, b) => b.totalGames - a.totalGames)
    const refereeGamesRanked = officialCounts
      .filter(o => o.refereeGames > 0)
      .sort((a, b) => b.refereeGames - a.refereeGames)
    const linespersonGamesRanked = officialCounts
      .filter(o => o.linespersonGames > 0)
      .sort((a, b) => b.linespersonGames - a.linespersonGames)

    // Find current official's rank (null if 0 games)
    const totalGamesRank = totalGames > 0
      ? totalGamesRanked.findIndex(o => o.id === id) + 1
      : null
    const refereeGamesRank = refereeGames > 0
      ? refereeGamesRanked.findIndex(o => o.id === id) + 1
      : null
    const linespersonGamesRank = linespersonGames > 0
      ? linespersonGamesRanked.findIndex(o => o.id === id) + 1
      : null

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
