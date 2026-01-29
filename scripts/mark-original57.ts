import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

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

async function markOriginal57() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    console.log('🏒 Marking Original 57 Officials...\n')

    // Get all officials
    const officials = await prisma.official.findMany()
    console.log(`Found ${officials.length} total officials`)

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

    console.log(`\n✅ Marked ${marked} officials as Original 57`)

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

markOriginal57()
