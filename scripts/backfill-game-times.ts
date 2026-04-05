import 'dotenv/config'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// npx tsx scripts/backfill-game-times.ts

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const BASE_URL = 'https://lscluster.hockeytech.com/game_reports/official-game-report.php'

function parseTimeToMinutes(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function computeDuration(startTime: string | null, endTime: string | null): number | null {
  if (!startTime || !endTime) return null
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)
  if (startMinutes === null || endMinutes === null) return null
  let duration = endMinutes - startMinutes
  if (duration < 0) duration += 24 * 60
  return duration
}

async function scrapeGameTimes(hockeytechId: number): Promise<{ startTime: string | null; endTime: string | null }> {
  try {
    const url = `${BASE_URL}?client_code=bchl&game_id=${hockeytechId}&lang_id=1`
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    const bodyText = $('body').text()
    const timeRegex = /\d{1,2}:\d{2}\s*[AP]M/i

    let startTime: string | null = null
    let endTime: string | null = null

    // Find TIME OF GAME table and extract times from cells in order
    $('td, th').each((_, el) => {
      const text = $(el).text().trim()
      if (text.toUpperCase().includes('TIME OF GAME')) {
        const table = $(el).closest('table')
        const times: string[] = []
        table.find('td').each((__, cell) => {
          const m = $(cell).text().trim().match(timeRegex)
          if (m) times.push(m[0])
        })
        if (times.length >= 2) { startTime = times[0]; endTime = times[1] }
        else if (times.length === 1) { startTime = times[0] }
        return false
      }
    })

    // Fallback to regex
    if (!startTime) { const m = bodyText.match(/Start:\s*(\d{1,2}:\d{2}\s*[AP]M)/i); if (m) startTime = m[1] }
    if (!endTime) { const m = bodyText.match(/End:\s*(\d{1,2}:\d{2}\s*[AP]M)/i); if (m) endTime = m[1] }

    return {
      startTime: startTime ? (startTime as string).trim() : null,
      endTime: endTime ? (endTime as string).trim() : null
    }
  } catch {
    return { startTime: null, endTime: null }
  }
}

async function backfill() {
  const games = await prisma.game.findMany({
    where: { duration: null },
    select: { id: true, hockeytechId: true },
    orderBy: { hockeytechId: 'asc' }
  })

  console.log(`Found ${games.length} games without duration data`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    const { startTime, endTime } = await scrapeGameTimes(game.hockeytechId)
    const duration = computeDuration(startTime, endTime)

    if (startTime && endTime && duration) {
      await prisma.game.update({
        where: { id: game.id },
        data: { startTime, endTime, duration }
      })
      updated++
      console.log(`[${i + 1}/${games.length}] Game ${game.hockeytechId}: ${startTime} - ${endTime} (${duration}min)`)
    } else {
      failed++
      console.log(`[${i + 1}/${games.length}] Game ${game.hockeytechId}: No time data found`)
    }

    // Small delay to avoid hammering the server
    if (i % 5 === 4) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\nDone! Updated: ${updated}, No data: ${failed}`)
  await prisma.$disconnect()
}

backfill().catch(console.error)
