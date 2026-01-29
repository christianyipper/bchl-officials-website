import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as readline from 'readline'

// Source: Local database
const sourcePool = new Pool({
  connectionString: process.env.DATABASE_URL
})
const sourceAdapter = new PrismaPg(sourcePool)
const sourcePrisma = new PrismaClient({ adapter: sourceAdapter })

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

async function migrateData(targetUrl: string) {
  console.log('🚀 Starting database migration...\n')

  // Target: Neon database
  const targetPool = new Pool({
    connectionString: targetUrl
  })
  const targetAdapter = new PrismaPg(targetPool)
  const targetPrisma = new PrismaClient({ adapter: targetAdapter })

  try {
    // Step 1: Verify source database connection
    console.log('📊 Checking source database...')
    const sourceStats = {
      teams: await sourcePrisma.team.count(),
      officials: await sourcePrisma.official.count(),
      games: await sourcePrisma.game.count(),
      gameOfficials: await sourcePrisma.gameOfficial.count()
    }
    console.log(`  ✓ Teams: ${sourceStats.teams}`)
    console.log(`  ✓ Officials: ${sourceStats.officials}`)
    console.log(`  ✓ Games: ${sourceStats.games}`)
    console.log(`  ✓ Game Officials: ${sourceStats.gameOfficials}`)

    // Step 2: Verify target database is empty or confirm overwrite
    console.log('\n📊 Checking target database...')
    const targetStats = {
      teams: await targetPrisma.team.count(),
      officials: await targetPrisma.official.count(),
      games: await targetPrisma.game.count(),
      gameOfficials: await targetPrisma.gameOfficial.count()
    }
    console.log(`  ℹ Teams: ${targetStats.teams}`)
    console.log(`  ℹ Officials: ${targetStats.officials}`)
    console.log(`  ℹ Games: ${targetStats.games}`)
    console.log(`  ℹ Game Officials: ${targetStats.gameOfficials}`)

    if (targetStats.teams > 0 || targetStats.officials > 0 || targetStats.games > 0) {
      console.log('\n⚠️  WARNING: Target database is not empty!')
      console.log('This migration will add data to the existing database.')
      console.log('Duplicate entries (based on unique constraints) will be skipped.\n')
    }

    // Step 3: Migrate Teams
    console.log('\n📦 Migrating Teams...')
    const teams = await sourcePrisma.team.findMany()
    let teamsCreated = 0
    let teamsSkipped = 0

    for (const team of teams) {
      try {
        await targetPrisma.team.upsert({
          where: { id: team.id },
          update: {},
          create: {
            id: team.id,
            name: team.name,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
          }
        })
        teamsCreated++
      } catch (error) {
        teamsSkipped++
      }
    }
    console.log(`  ✓ Created: ${teamsCreated}, Skipped: ${teamsSkipped}`)

    // Step 4: Migrate Officials
    console.log('\n👥 Migrating Officials...')
    const officials = await sourcePrisma.official.findMany()
    let officialsCreated = 0
    let officialsSkipped = 0

    for (const official of officials) {
      try {
        await targetPrisma.official.upsert({
          where: { id: official.id },
          update: {},
          create: {
            id: official.id,
            name: official.name,
            createdAt: official.createdAt,
            updatedAt: official.updatedAt
          }
        })
        officialsCreated++
      } catch (error) {
        officialsSkipped++
      }
    }
    console.log(`  ✓ Created: ${officialsCreated}, Skipped: ${officialsSkipped}`)

    // Step 5: Migrate Games
    console.log('\n🏒 Migrating Games...')
    const games = await sourcePrisma.game.findMany()
    let gamesCreated = 0
    let gamesSkipped = 0

    for (const game of games) {
      try {
        await targetPrisma.game.upsert({
          where: { id: game.id },
          update: {},
          create: {
            id: game.id,
            hockeytechId: game.hockeytechId,
            date: game.date,
            season: game.season,
            location: game.location,
            homeTeamId: game.homeTeamId,
            awayTeamId: game.awayTeamId,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt
          }
        })
        gamesCreated++
      } catch (error) {
        gamesSkipped++
      }
    }
    console.log(`  ✓ Created: ${gamesCreated}, Skipped: ${gamesSkipped}`)

    // Step 6: Migrate Game Officials
    console.log('\n🎫 Migrating Game Officials...')
    const gameOfficials = await sourcePrisma.gameOfficial.findMany()
    let gameOfficialsCreated = 0
    let gameOfficialsSkipped = 0

    for (const gameOfficial of gameOfficials) {
      try {
        await targetPrisma.gameOfficial.upsert({
          where: { id: gameOfficial.id },
          update: {},
          create: {
            id: gameOfficial.id,
            gameId: gameOfficial.gameId,
            officialId: gameOfficial.officialId,
            role: gameOfficial.role,
            createdAt: gameOfficial.createdAt
          }
        })
        gameOfficialsCreated++
      } catch (error) {
        gameOfficialsSkipped++
      }
    }
    console.log(`  ✓ Created: ${gameOfficialsCreated}, Skipped: ${gameOfficialsSkipped}`)

    // Step 7: Verify migration
    console.log('\n✅ Verifying migration...')
    const finalTargetStats = {
      teams: await targetPrisma.team.count(),
      officials: await targetPrisma.official.count(),
      games: await targetPrisma.game.count(),
      gameOfficials: await targetPrisma.gameOfficial.count()
    }

    console.log('\n📊 Final Statistics:')
    console.log('┌─────────────────┬────────┬────────┬─────────┐')
    console.log('│ Table           │ Source │ Target │ Match   │')
    console.log('├─────────────────┼────────┼────────┼─────────┤')
    console.log(`│ Teams           │ ${String(sourceStats.teams).padEnd(6)} │ ${String(finalTargetStats.teams).padEnd(6)} │ ${sourceStats.teams === finalTargetStats.teams ? '✓' : '✗'}       │`)
    console.log(`│ Officials       │ ${String(sourceStats.officials).padEnd(6)} │ ${String(finalTargetStats.officials).padEnd(6)} │ ${sourceStats.officials === finalTargetStats.officials ? '✓' : '✗'}       │`)
    console.log(`│ Games           │ ${String(sourceStats.games).padEnd(6)} │ ${String(finalTargetStats.games).padEnd(6)} │ ${sourceStats.games === finalTargetStats.games ? '✓' : '✗'}       │`)
    console.log(`│ Game Officials  │ ${String(sourceStats.gameOfficials).padEnd(6)} │ ${String(finalTargetStats.gameOfficials).padEnd(6)} │ ${sourceStats.gameOfficials === finalTargetStats.gameOfficials ? '✓' : '✗'}       │`)
    console.log('└─────────────────┴────────┴────────┴─────────┘')

    const allMatch =
      sourceStats.teams === finalTargetStats.teams &&
      sourceStats.officials === finalTargetStats.officials &&
      sourceStats.games === finalTargetStats.games &&
      sourceStats.gameOfficials === finalTargetStats.gameOfficials

    if (allMatch) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('All records have been migrated to Neon.')
    } else {
      console.log('\n⚠️  Migration completed with differences.')
      console.log('Some records may have been skipped due to existing data.')
    }

    console.log('\n📝 Next Steps:')
    console.log('1. Update Vercel environment variables:')
    console.log('   - DATABASE_URL: Your Neon connection string')
    console.log('   - NEXT_PUBLIC_BASE_URL: Your Vercel deployment URL')
    console.log('2. Trigger a new Vercel deployment')
    console.log('3. Test the production site')
    console.log('4. Set up GitHub Actions secret APP_URL for daily scraping')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
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
  console.log('║   BCHL Officials Database Migration: Local → Neon         ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  console.log('\nThis script will migrate your local database to Neon.')
  console.log('Make sure you have:')
  console.log('  1. ✓ Created a Neon project')
  console.log('  2. ✓ Run migrations on Neon: DATABASE_URL="neon-url" npx prisma migrate deploy')
  console.log('  3. ✓ Your Neon connection string ready')

  const neonUrl = await promptForNeonUrl()

  if (!neonUrl) {
    console.log('\n❌ No connection string provided. Exiting.')
    process.exit(1)
  }

  await migrateData(neonUrl)
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
