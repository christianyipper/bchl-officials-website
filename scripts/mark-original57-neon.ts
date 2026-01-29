import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as readline from 'readline'

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

async function markOriginal57(neonUrl: string) {
  const pool = new Pool({
    connectionString: neonUrl
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🏒 Marking Original 57 Officials in Neon...\n')

    // Get all officials
    const officials = await prisma.official.findMany()
    console.log(`Found ${officials.length} total officials in Neon`)

    let marked = 0
    const markedOfficials: string[] = []

    for (const official of officials) {
      // Extract last name (assumes format "First Last" or "First Middle Last")
      const nameParts = official.name.trim().split(' ')
      const lastName = nameParts[nameParts.length - 1]

      // Check if this official's last name is in the Original 57 list
      const isOriginal57 = ORIGINAL_57_LAST_NAMES.some(
        originalLastName => lastName.toLowerCase() === originalLastName.toLowerCase()
      )

      if (isOriginal57) {
        await prisma.official.update({
          where: { id: official.id },
          data: { original57: 1 }
        })
        marked++
        markedOfficials.push(official.name)
        console.log(`  ✓ Marked: ${official.name}`)
      }
    }

    console.log(`\n✅ Marked ${marked} officials as Original 57 in Neon`)

    if (marked < ORIGINAL_57_LAST_NAMES.length) {
      console.log(`\n⚠️  Expected ${ORIGINAL_57_LAST_NAMES.length} officials but only found ${marked}`)
      console.log('Some officials may not be in the database yet.')
    }

  } catch (error) {
    console.error('Error marking Original 57 officials:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║      Mark Original 57 Officials in Neon Database          ║')
  console.log('╚════════════════════════════════════════════════════════════╝')

  const neonUrl = await promptForNeonUrl()

  if (!neonUrl) {
    console.log('\n❌ No connection string provided. Exiting.')
    process.exit(1)
  }

  await markOriginal57(neonUrl)
}

main()
