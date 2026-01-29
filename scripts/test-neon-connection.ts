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

async function testConnection(neonUrl: string) {
  console.log('🔌 Testing Neon database connection...\n')

  const pool = new Pool({
    connectionString: neonUrl
  })

  try {
    // Test raw connection first
    console.log('Step 1: Testing raw PostgreSQL connection...')
    const client = await pool.connect()
    console.log('  ✓ Raw connection successful!')

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('\nStep 2: Checking database schema...')
    if (result.rows.length === 0) {
      console.log('  ⚠️  No tables found in database!')
      console.log('  You need to run migrations first:')
      console.log('  $env:DATABASE_URL="your-neon-url"')
      console.log('  npx prisma migrate deploy')
      client.release()
      return
    }

    console.log('  ✓ Found tables:')
    result.rows.forEach(row => {
      console.log(`    - ${row.table_name}`)
    })

    client.release()

    // Test Prisma connection
    console.log('\nStep 3: Testing Prisma client connection...')
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    // Try to count records
    try {
      const teamCount = await prisma.team.count()
      console.log(`  ✓ Prisma connection successful!`)
      console.log(`  ✓ Teams: ${teamCount}`)

      const officialCount = await prisma.official.count()
      console.log(`  ✓ Officials: ${officialCount}`)

      const gameCount = await prisma.game.count()
      console.log(`  ✓ Games: ${gameCount}`)

      console.log('\n✅ Connection test passed!')
      console.log('Your Neon database is ready for migration.')

    } catch (error) {
      console.log('  ✗ Prisma query failed')
      console.log('  Error:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }

  } catch (error: any) {
    console.log('\n❌ Connection test failed!')
    console.log('\nError details:')
    console.log(`  Message: ${error.message}`)
    if (error.code) {
      console.log(`  Code: ${error.code}`)
    }

    console.log('\nPossible issues:')
    console.log('  1. Invalid connection string format')
    console.log('  2. Database doesn\'t exist')
    console.log('  3. Migrations haven\'t been run (no tables)')
    console.log('  4. Network/firewall blocking connection')
    console.log('  5. Neon database is paused/hibernated')

    throw error
  } finally {
    await pool.end()
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║          Neon Database Connection Test                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  const neonUrl = await promptForNeonUrl()

  if (!neonUrl) {
    console.log('\n❌ No connection string provided. Exiting.')
    process.exit(1)
  }

  await testConnection(neonUrl)
}

main()
  .catch((error) => {
    console.error('\nFatal error:', error.message)
    process.exit(1)
  })
