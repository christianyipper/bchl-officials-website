import 'dotenv/config'
import { prisma } from '../lib/prisma'

function getSeasonFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  if (month >= 9) {
    return `${year}-${String(year + 1).slice(-2)}`
  } else {
    return `${year - 1}-${String(year).slice(-2)}`
  }
}

async function checkAllSeasons() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      hockeytechId: true,
      date: true,
      season: true
    }
  })

  console.log(`Checking ${games.length} games for season mismatches...\n`)

  const mismatches = games.filter(game => {
    const correctSeason = getSeasonFromDate(game.date)
    return game.season !== correctSeason
  })

  if (mismatches.length === 0) {
    console.log('✓ All games have correct seasons!')
  } else {
    console.log(`Found ${mismatches.length} games with incorrect seasons:\n`)
    mismatches.forEach(game => {
      const correctSeason = getSeasonFromDate(game.date)
      console.log(`Game ${game.hockeytechId}: ${game.date.toISOString().split('T')[0]}`)
      console.log(`  Current: ${game.season}, Should be: ${correctSeason}`)
    })
  }

  await prisma.$disconnect()
}

checkAllSeasons()
