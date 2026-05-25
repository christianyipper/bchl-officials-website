import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// npx tsx scripts/backfill-dates.ts
// Shifts all game dates stored at midnight UTC to noon UTC so they display
// correctly in every timezone (fixes the "one day early" display bug).

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function backfill() {
  const games = await prisma.game.findMany({
    select: { id: true, date: true }
  })

  const toFix = games.filter(g => g.date.getUTCHours() === 0)
  console.log(`Found ${toFix.length} games to fix out of ${games.length} total`)

  let updated = 0
  for (const game of toFix) {
    const newDate = new Date(game.date.getTime() + 12 * 60 * 60 * 1000)
    await prisma.game.update({
      where: { id: game.id },
      data: { date: newDate }
    })
    updated++
    if (updated % 50 === 0) console.log(`  ${updated}/${toFix.length}...`)
  }

  console.log(`Done. Updated ${updated} game(s).`)
  await prisma.$disconnect()
}

backfill().catch(console.error)
