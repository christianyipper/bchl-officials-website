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

async function verifyMigration(targetUrl: string) {
  console.log('🔍 Starting migration verification...\n')

  // Source: Local database
  const sourcePool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const sourceAdapter = new PrismaPg(sourcePool)
  const sourcePrisma = new PrismaClient({ adapter: sourceAdapter })

  // Target: Neon database
  const targetPool = new Pool({
    connectionString: targetUrl
  })
  const targetAdapter = new PrismaPg(targetPool)
  const targetPrisma = new PrismaClient({ adapter: targetAdapter })

  try {
    console.log('📊 Comparing record counts...\n')

    // Count records
    const sourceStats = {
      teams: await sourcePrisma.team.count(),
      officials: await sourcePrisma.official.count(),
      games: await sourcePrisma.game.count(),
      gameOfficials: await sourcePrisma.gameOfficial.count()
    }

    const targetStats = {
      teams: await targetPrisma.team.count(),
      officials: await targetPrisma.official.count(),
      games: await targetPrisma.game.count(),
      gameOfficials: await targetPrisma.gameOfficial.count()
    }

    // Display comparison table
    console.log('┌─────────────────┬────────┬────────┬─────────┐')
    console.log('│ Table           │ Local  │ Neon   │ Status  │')
    console.log('├─────────────────┼────────┼────────┼─────────┤')

    const teamsMatch = sourceStats.teams === targetStats.teams
    console.log(`│ Teams           │ ${String(sourceStats.teams).padEnd(6)} │ ${String(targetStats.teams).padEnd(6)} │ ${teamsMatch ? '✓ Match' : '✗ Diff '} │`)

    const officialsMatch = sourceStats.officials === targetStats.officials
    console.log(`│ Officials       │ ${String(sourceStats.officials).padEnd(6)} │ ${String(targetStats.officials).padEnd(6)} │ ${officialsMatch ? '✓ Match' : '✗ Diff '} │`)

    const gamesMatch = sourceStats.games === targetStats.games
    console.log(`│ Games           │ ${String(sourceStats.games).padEnd(6)} │ ${String(targetStats.games).padEnd(6)} │ ${gamesMatch ? '✓ Match' : '✗ Diff '} │`)

    const gameOfficialsMatch = sourceStats.gameOfficials === targetStats.gameOfficials
    console.log(`│ Game Officials  │ ${String(sourceStats.gameOfficials).padEnd(6)} │ ${String(targetStats.gameOfficials).padEnd(6)} │ ${gameOfficialsMatch ? '✓ Match' : '✗ Diff '} │`)

    console.log('└─────────────────┴────────┴────────┴─────────┘')

    const allMatch = teamsMatch && officialsMatch && gamesMatch && gameOfficialsMatch

    console.log('\n📋 Sample Data Verification...\n')

    // Verify a few sample records
    const sampleTeam = await sourcePrisma.team.findFirst()
    if (sampleTeam) {
      const targetTeam = await targetPrisma.team.findUnique({ where: { id: sampleTeam.id } })
      console.log(`Sample Team: ${sampleTeam.name} - ${targetTeam ? '✓ Found in Neon' : '✗ Missing in Neon'}`)
    }

    const sampleOfficial = await sourcePrisma.official.findFirst({
      where: { name: { not: '-' } }
    })
    if (sampleOfficial) {
      const targetOfficial = await targetPrisma.official.findUnique({ where: { id: sampleOfficial.id } })
      console.log(`Sample Official: ${sampleOfficial.name} - ${targetOfficial ? '✓ Found in Neon' : '✗ Missing in Neon'}`)
    }

    const sampleGame = await sourcePrisma.game.findFirst()
    if (sampleGame) {
      const targetGame = await targetPrisma.game.findUnique({ where: { id: sampleGame.id } })
      console.log(`Sample Game: ID ${sampleGame.hockeytechId} - ${targetGame ? '✓ Found in Neon' : '✗ Missing in Neon'}`)
    }

    // Check seasons distribution
    console.log('\n📅 Season Distribution...\n')

    const localSeasons = await sourcePrisma.game.groupBy({
      by: ['season'],
      _count: { season: true }
    })

    const neonSeasons = await targetPrisma.game.groupBy({
      by: ['season'],
      _count: { season: true }
    })

    console.log('Local:')
    localSeasons.forEach(s => {
      console.log(`  ${s.season}: ${s._count.season} games`)
    })

    console.log('\nNeon:')
    neonSeasons.forEach(s => {
      console.log(`  ${s.season}: ${s._count.season} games`)
    })

    // Final verdict
    console.log('\n' + '='.repeat(60))
    if (allMatch) {
      console.log('✅ VERIFICATION PASSED')
      console.log('All data has been successfully migrated to Neon!')
    } else {
      console.log('⚠️  VERIFICATION FAILED')
      console.log('There are differences between local and Neon databases.')
      console.log('Please review the counts above and re-run migration if needed.')
    }
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Verification failed:', error)
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
  console.log('║      BCHL Officials Database Migration Verification       ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  const neonUrl = await promptForNeonUrl()

  if (!neonUrl) {
    console.log('\n❌ No connection string provided. Exiting.')
    process.exit(1)
  }

  await verifyMigration(neonUrl)
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
