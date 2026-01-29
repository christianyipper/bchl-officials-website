import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const NEON_URL = 'postgresql://neondb_owner:npg_xqByCwA8s7Gh@ep-raspy-hill-ah7tiq9y-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const ORIGINAL_57_LAST_NAMES = [
  'Leardo', 'Ewing', 'Williams', 'Lohmeier', 'Williamson', 'Brown', 'Pavia',
  'Eising', 'Dahl', 'Caillet', 'Way', 'Casavant', 'Yip', 'Townsend', 'Barish',
  'Oakley', 'Hall', 'McKinnon', 'Wright', 'Watson', 'Wood', 'Nelson',
  'Epp Hopfner', 'Hessami', 'Trent', 'Olfert', 'Bennett', 'Connelly',
  'Butler', 'Ruschin', 'Thast', 'Casparie', 'Tazelaar', 'Pankiw', 'Moorman',
  'Devries', 'Geddes', 'Tyson', 'Chapdelaine', 'Reid', 'Lucoe', 'Blake',
  'McKay', 'Flynn', 'McDonald', 'Maniago', 'Chernoff', 'Alyward', 'Spencer',
  'Seifried', 'Gagnon', 'Hogarth', 'Flanagan', 'Small', 'Calkins', 'Fitzgerald'
]

async function fullNeonMigration() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║           Full Neon Database Migration                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // Step 1: Reset Neon database
  console.log('Step 1: Resetting Neon database...\n')
  const neonPool = new Pool({ connectionString: NEON_URL })

  try {
    // Drop all tables
    await neonPool.query('DROP SCHEMA public CASCADE')
    await neonPool.query('CREATE SCHEMA public')
    await neonPool.query('GRANT ALL ON SCHEMA public TO neondb_owner')
    await neonPool.query('GRANT ALL ON SCHEMA public TO public')
    console.log('✓ Neon database reset complete\n')
  } catch (error) {
    console.error('Error resetting database:', error)
    throw error
  } finally {
    await neonPool.end()
  }

  // Step 2: Apply schema to Neon
  console.log('Step 2: Applying schema to Neon...\n')
  const { execSync } = await import('child_process')
  try {
    execSync(`npx prisma db push --accept-data-loss`, {
      env: { ...process.env, DATABASE_URL: NEON_URL },
      stdio: 'inherit'
    })
    console.log('\n✓ Schema applied to Neon\n')
  } catch (error) {
    console.error('Error applying schema:', error)
    throw error
  }

  // Step 3: Migrate data from local to Neon
  console.log('Step 3: Migrating data from local to Neon...\n')

  const localPool = new Pool({ connectionString: process.env.DATABASE_URL })
  const localAdapter = new PrismaPg(localPool)
  const localPrisma = new PrismaClient({ adapter: localAdapter })

  const neonPool2 = new Pool({ connectionString: NEON_URL })
  const neonAdapter = new PrismaPg(neonPool2)
  const neonPrisma = new PrismaClient({ adapter: neonAdapter })

  try {
    // Migrate Teams
    console.log('Migrating Teams...')
    const teams = await localPrisma.team.findMany()
    for (const team of teams) {
      await neonPrisma.team.upsert({
        where: { id: team.id },
        create: team,
        update: team
      })
    }
    console.log(`✓ Migrated ${teams.length} teams\n`)

    // Migrate Officials
    console.log('Migrating Officials...')
    const officials = await localPrisma.official.findMany()
    for (const official of officials) {
      await neonPrisma.official.upsert({
        where: { id: official.id },
        create: official,
        update: official
      })
    }
    console.log(`✓ Migrated ${officials.length} officials\n`)

    // Migrate Games
    console.log('Migrating Games...')
    const games = await localPrisma.game.findMany()
    let gameCount = 0
    for (const game of games) {
      await neonPrisma.game.upsert({
        where: { id: game.id },
        create: game,
        update: {
          hockeytechId: game.hockeytechId,
          date: game.date,
          season: game.season,
          location: game.location,
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          updatedAt: game.updatedAt
        }
      })
      gameCount++
      if (gameCount % 50 === 0) {
        console.log(`  Migrated ${gameCount}/${games.length} games...`)
      }
    }
    console.log(`✓ Migrated ${games.length} games\n`)

    // Migrate GameOfficials
    console.log('Migrating Game Assignments...')
    const gameOfficials = await localPrisma.gameOfficial.findMany()
    let assignmentCount = 0
    for (const go of gameOfficials) {
      await neonPrisma.gameOfficial.upsert({
        where: {
          gameId_officialId: {
            gameId: go.gameId,
            officialId: go.officialId
          }
        },
        create: go,
        update: {
          role: go.role,
          createdAt: go.createdAt
        }
      })
      assignmentCount++
      if (assignmentCount % 100 === 0) {
        console.log(`  Migrated ${assignmentCount}/${gameOfficials.length} assignments...`)
      }
    }
    console.log(`✓ Migrated ${gameOfficials.length} game assignments\n`)

    // Step 4: Mark Original 57 officials
    console.log('Step 4: Marking Original 57 officials in Neon...\n')

    const neonOfficials = await neonPrisma.official.findMany()
    let marked = 0
    const markedOfficials: string[] = []

    for (const official of neonOfficials) {
      const nameParts = official.name.trim().split(' ')
      const lastName = nameParts[nameParts.length - 1]

      const isOriginal57 = ORIGINAL_57_LAST_NAMES.some(
        originalLastName => lastName.toLowerCase() === originalLastName.toLowerCase()
      )

      if (isOriginal57) {
        await neonPrisma.official.update({
          where: { id: official.id },
          data: { original57: 1 }
        })
        marked++
        markedOfficials.push(official.name)
        console.log(`  ✓ Marked: ${official.name}`)
      }
    }

    console.log(`\n✓ Marked ${marked} officials as Original 57\n`)

    // Step 5: Verify migration
    console.log('Step 5: Verifying migration...\n')

    const neonTeamCount = await neonPrisma.team.count()
    const neonOfficialCount = await neonPrisma.official.count()
    const neonGameCount = await neonPrisma.game.count()
    const neonAssignmentCount = await neonPrisma.gameOfficial.count()
    const neonOriginal57Count = await neonPrisma.official.count({
      where: { original57: 1 }
    })

    console.log('Neon Database Counts:')
    console.log(`  Teams: ${neonTeamCount}`)
    console.log(`  Officials: ${neonOfficialCount}`)
    console.log(`  Games: ${neonGameCount}`)
    console.log(`  Game Assignments: ${neonAssignmentCount}`)
    console.log(`  Original 57 Officials: ${neonOriginal57Count}`)

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║              Migration Complete!                          ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')
    console.log('Next steps:')
    console.log('1. Update DATABASE_URL in Vercel environment variables')
    console.log('2. Redeploy your Vercel application')
    console.log('3. Test the production site\n')

  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  } finally {
    await localPrisma.$disconnect()
    await neonPrisma.$disconnect()
    await localPool.end()
    await neonPool2.end()
  }
}

fullNeonMigration()
