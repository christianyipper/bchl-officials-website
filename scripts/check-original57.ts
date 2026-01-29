import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function checkOriginal57() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const original57Officials = await prisma.official.findMany({
      where: {
        original57: 1
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`\nFound ${original57Officials.length} Original 57 officials:\n`)
    original57Officials.forEach((official, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${official.name}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

checkOriginal57()
