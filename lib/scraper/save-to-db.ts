import { prisma } from '@/lib/prisma'
import { ScrapedGame } from './types'

export async function saveGameToDatabase(game: ScrapedGame) {
  try {
    // Check if game already exists
    const existingGame = await prisma.game.findUnique({
      where: { hockeytechId: game.hockeytechId }
    })

    if (existingGame) {
      console.log(`Game ${game.hockeytechId} already exists in database. Skipping.`)
      return { success: true, existed: true }
    }

    // Find or create teams
    const homeTeam = await prisma.team.upsert({
      where: { name: game.homeTeam },
      update: {},
      create: { name: game.homeTeam }
    })

    const awayTeam = await prisma.team.upsert({
      where: { name: game.awayTeam },
      update: {},
      create: { name: game.awayTeam }
    })

    // Parse the date string (format: "Jan 1, 2026")
    const gameDate = new Date(game.date)

    // Create the game
    const createdGame = await prisma.game.create({
      data: {
        hockeytechId: game.hockeytechId,
        date: gameDate,
        location: game.location,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id
      }
    })

    // Create officials and link them to the game
    const officialPromises = []

    // Process referees
    for (const refName of game.referees) {
      const official = await prisma.official.upsert({
        where: { name: refName },
        update: {},
        create: { name: refName }
      })

      officialPromises.push(
        prisma.gameOfficial.create({
          data: {
            gameId: createdGame.id,
            officialId: official.id,
            role: 'referee'
          }
        })
      )
    }

    // Process linespeople
    for (const linespersonName of game.linespeople) {
      const official = await prisma.official.upsert({
        where: { name: linespersonName },
        update: {},
        create: { name: linespersonName }
      })

      officialPromises.push(
        prisma.gameOfficial.create({
          data: {
            gameId: createdGame.id,
            officialId: official.id,
            role: 'linesperson'
          }
        })
      )
    }

    await Promise.all(officialPromises)

    console.log(`✓ Saved game ${game.hockeytechId} to database`)
    return { success: true, existed: false }
  } catch (error) {
    console.error(`Error saving game ${game.hockeytechId} to database:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function scrapeAndSaveGames(gameIds: number[]) {
  const results = {
    total: gameIds.length,
    successful: 0,
    failed: 0,
    alreadyExisted: 0,
    errors: [] as { gameId: number; error: string }[]
  }

  for (const gameId of gameIds) {
    const { scrapeGameReport } = await import('./scraper')
    const result = await scrapeGameReport(gameId)

    if (result.success && result.game) {
      const saveResult = await saveGameToDatabase(result.game)
      if (saveResult.success) {
        if (saveResult.existed) {
          results.alreadyExisted++
        } else {
          results.successful++
        }
      } else {
        results.failed++
        results.errors.push({
          gameId,
          error: saveResult.error || 'Failed to save to database'
        })
      }
    } else {
      results.failed++
      results.errors.push({
        gameId,
        error: result.error || 'Failed to scrape game'
      })
    }
  }

  return results
}
