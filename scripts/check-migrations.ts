import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function checkMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const migrations = await prisma.$queryRaw<Array<{
      migration_name: string
      finished_at: Date | null
      rolled_back_at: Date | null
    }>>`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY finished_at`

    console.log('\nApplied Migrations:')
    console.log('===================\n')
    migrations.forEach((m, i) => {
      console.log(`${i + 1}. ${m.migration_name}`)
      console.log(`   Finished: ${m.finished_at}`)
      if (m.rolled_back_at) {
        console.log(`   Rolled back: ${m.rolled_back_at}`)
      }
      console.log()
    })
    console.log(`Total: ${migrations.length} migrations applied\n`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

checkMigrations()
