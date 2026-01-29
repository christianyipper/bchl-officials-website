import 'dotenv/config'
import { prisma } from '../lib/prisma'

// Helper function to determine the season based on game date
// Hockey season runs from September to April/August, so:
// - Games from Sept-Dec use current year as start year (e.g., Sept 2025 = "2025-26")
// - Games from Jan-Aug use previous year as start year (e.g., Jan 2026 = "2025-26")
function getSeasonFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() is 0-indexed

  if (month >= 9) {
    // September through December
    return `${year}-${String(year + 1).slice(-2)}`
  } else {
    // January through August
    return `${year - 1}-${String(year).slice(-2)}`
  }
}

async function updateGameSeasons() {
  console.log('Fetching all games...')
  const games = await prisma.game.findMany({
    select: {
      id: true,
      date: true,
      season: true,
    },
  })

  console.log(`Found ${games.length} games`)

  let updated = 0
  for (const game of games) {
    const correctSeason = getSeasonFromDate(game.date)

    if (game.season !== correctSeason) {
      await prisma.game.update({
        where: { id: game.id },
        data: { season: correctSeason },
      })
      console.log(`Updated game ${game.id}: ${game.season} → ${correctSeason}`)
      updated++
    }
  }

  console.log(`\n✓ Updated ${updated} games`)
  console.log(`✓ ${games.length - updated} games already had correct season`)
}

updateGameSeasons()
  .catch((error) => {
    console.error('Error updating seasons:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
