import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as readline from 'readline'

async function promptForNeonUrl(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('\nEnter your Neon database connection string: ', (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function updateSeasons(neonUrl: string) {
  console.log('🚀 Starting season update...\n')

  // Source: Local database
  const sourcePool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const sourceAdapter = new PrismaPg(sourcePool)
  const sourcePrisma = new PrismaClient({ adapter: sourceAdapter })

  // Target: Neon database
  const targetPool = new Pool({
    connectionString: neonUrl
  })
  const targetAdapter = new PrismaPg(targetPool)
  const targetPrisma = new PrismaClient({ adapter: targetAdapter })

  try {
    console.log('📊 Fetching games from local database...')
    const localGames = await sourcePrisma.game.findMany({
      select: {
        id: true,
        season: true,
        date: true
      }
    })
    console.log(`  ✓ Found ${localGames.length} games in local database`)

    console.log('\n📊 Checking current seasons in Neon...')
    const neonSeasons = await targetPrisma.game.groupBy({
      by: ['season'],
      _count: { season: true }
    })
    console.log('  Current Neon seasons:')
    neonSeasons.forEach(s => console.log(`    ${s.season}: ${s._count.season} games`))

    console.log('\n🔄 Updating seasons in Neon...')
    let updated = 0
    let notFound = 0
    let failed = 0
    let errors: Array<{ gameId: string, error: string }> = []

    for (const game of localGames) {
      try {
        const result = await targetPrisma.game.updateMany({
          where: { id: game.id },
          data: {
            season: game.season
          }
        })

        if (result.count > 0) {
          updated++
        } else {
          notFound++
        }

        if (updated % 100 === 0 && updated > 0) {
          console.log(`  ✓ Updated ${updated}/${localGames.length} games`)
        }
      } catch (error: any) {
        failed++
        errors.push({
          gameId: game.id,
          error: error.message
        })
        if (failed <= 5) {
          console.log(`  ✗ Failed to update game ${game.id}: ${error.message}`)
        }
      }
    }

    console.log(`\n✓ Updated: ${updated} games`)
    if (notFound > 0) {
      console.log(`⚠ Not found in Neon: ${notFound} games`)
    }
    if (failed > 0) {
      console.log(`✗ Failed: ${failed} games`)
      if (errors.length > 5) {
        console.log(`  (showing first 5 errors, ${errors.length - 5} more errors occurred)`)
      }
    }

    console.log('\n📊 Verifying new seasons in Neon...')
    const updatedSeasons = await targetPrisma.game.groupBy({
      by: ['season'],
      _count: { season: true },
      orderBy: { season: 'asc' }
    })
    console.log('  Updated Neon seasons:')
    updatedSeasons.forEach(s => console.log(`    ${s.season}: ${s._count.season} games`))

    console.log('\n✅ Season update complete!')

  } catch (error) {
    console.error('\n❌ Update failed:', error)
    throw error
  } finally {
    await sourcePrisma.$disconnect()
    await targetPrisma.$disconnect()
    await sourcePool.end()
    await targetPool.end()
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║         Fix Game Seasons in Neon Database                 ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  const neonUrl = await promptForNeonUrl()

  if (!neonUrl) {
    console.log('\n❌ No connection string provided. Exiting.')
    process.exit(1)
  }

  await updateSeasons(neonUrl)
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
