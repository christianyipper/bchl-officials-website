import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// AHL experience
const AHL_LAST_NAMES = ['Eising', 'Wilson', 'Parsons', 'Betker', 'Williams', 'Ewing', 'Allan', 'Tyson', 'Phillips']

// ECHL experience
const ECHL_LAST_NAMES = ['Wilson', 'Pavia']

// PWHL experience
const PWHL_LAST_NAMES = ['Eising', 'Williams', 'Butler']

async function markLeagueExperience() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🏒 Marking League Experience in Local Database...\n')

    const officials = await prisma.official.findMany()
    console.log(`Found ${officials.length} total officials\n`)

    let ahlMarked = 0
    let echlMarked = 0
    let pwhlMarked = 0

    console.log('Marking AHL Officials...')
    for (const official of officials) {
      const nameParts = official.name.trim().split(' ')
      const lastName = nameParts[nameParts.length - 1]

      const hasAHL = AHL_LAST_NAMES.some(
        leagueLastName => lastName.toLowerCase() === leagueLastName.toLowerCase()
      )

      if (hasAHL) {
        await prisma.official.update({
          where: { id: official.id },
          data: { ahl: 1 }
        })
        ahlMarked++
        console.log(`  ✓ AHL: ${official.name}`)
      }
    }

    console.log(`\n✓ Marked ${ahlMarked} officials with AHL experience\n`)

    console.log('Marking ECHL Officials...')
    for (const official of officials) {
      const nameParts = official.name.trim().split(' ')
      const lastName = nameParts[nameParts.length - 1]

      const hasECHL = ECHL_LAST_NAMES.some(
        leagueLastName => lastName.toLowerCase() === leagueLastName.toLowerCase()
      )

      if (hasECHL) {
        await prisma.official.update({
          where: { id: official.id },
          data: { echl: 1 }
        })
        echlMarked++
        console.log(`  ✓ ECHL: ${official.name}`)
      }
    }

    console.log(`\n✓ Marked ${echlMarked} officials with ECHL experience\n`)

    console.log('Marking PWHL Officials...')
    for (const official of officials) {
      const nameParts = official.name.trim().split(' ')
      const lastName = nameParts[nameParts.length - 1]

      const hasPWHL = PWHL_LAST_NAMES.some(
        leagueLastName => lastName.toLowerCase() === leagueLastName.toLowerCase()
      )

      if (hasPWHL) {
        await prisma.official.update({
          where: { id: official.id },
          data: { pwhl: 1 }
        })
        pwhlMarked++
        console.log(`  ✓ PWHL: ${official.name}`)
      }
    }

    console.log(`\n✓ Marked ${pwhlMarked} officials with PWHL experience\n`)

    // Verify
    const ahlCount = await prisma.official.count({ where: { ahl: 1 } })
    const echlCount = await prisma.official.count({ where: { echl: 1 } })
    const pwhlCount = await prisma.official.count({ where: { pwhl: 1 } })

    console.log('Summary:')
    console.log(`  AHL Officials: ${ahlCount}`)
    console.log(`  ECHL Officials: ${echlCount}`)
    console.log(`  PWHL Officials: ${pwhlCount}`)
    console.log('\n✅ League experience marking complete!')

  } catch (error) {
    console.error('Error marking league experience:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

markLeagueExperience()
