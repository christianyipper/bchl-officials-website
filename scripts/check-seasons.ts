import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('📊 Checking season distribution in database:\n')

    const games = await prisma.game.groupBy({
      by: ['season'],
      _count: {
        season: true
      },
      orderBy: {
        season: 'asc'
      }
    })

    console.log('Seasons found:')
    games.forEach(g => {
      console.log(`  ${g.season}: ${g._count.season} games`)
    })

    const total = games.reduce((sum, g) => sum + g._count.season, 0)
    console.log(`\nTotal: ${total} games`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
