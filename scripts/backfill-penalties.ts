import 'dotenv/config'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// npx tsx scripts/backfill-penalties.ts

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const BASE_URL = 'https://lscluster.hockeytech.com/game_reports/official-game-report.php'

interface ScrapedPenalty {
  period: string
  minutes: number
  offence: string
  side: 'home' | 'away' | null
}

function extractPenalties($: cheerio.CheerioAPI, homeTeam: string, awayTeam: string): ScrapedPenalty[] {
  const penalties: ScrapedPenalty[] = []

  $('b').each((_, el) => {
    const text = $(el).text().trim()
    if (!text.includes('PENALTIES')) return

    const headerTeam = text.replace('PENALTIES', '').trim().toUpperCase()
    let side: 'home' | 'away' | null = null
    if (homeTeam && headerTeam && homeTeam.toUpperCase().startsWith(headerTeam)) {
      side = 'home'
    } else if (awayTeam && headerTeam && awayTeam.toUpperCase().startsWith(headerTeam)) {
      side = 'away'
    }

    const table = $(el).closest('table')
    if (!table.length) return

    table.find('tr').each((i, row) => {
      if (i < 2) return
      const cells = $(row).find('td')
      if (cells.length < 4) return

      const period = cells.eq(0).text().trim()
      const minutesStr = cells.eq(2).text().trim()
      const offence = cells.eq(3).text().trim()

      if (!['1st', '2nd', '3rd'].includes(period) && !period.startsWith('OT')) return
      if (!offence) return

      const mins = parseInt(minutesStr.split(':')[0])
      if (isNaN(mins)) return

      penalties.push({ period, minutes: mins, offence, side })
    })
  })

  return penalties
}

async function scrapePenalties(hockeytechId: number): Promise<ScrapedPenalty[]> {
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

    const homeMatch = bodyText.match(/Home Team:\s*([^\n]+)/)
    const awayMatch = bodyText.match(/Visiting Team:\s*([^\n]+)/)
    const homeTeam = homeMatch ? homeMatch[1].trim() : ''
    const awayTeam = awayMatch ? awayMatch[1].trim() : ''

    return extractPenalties($, homeTeam, awayTeam)
  } catch {
    return []
  }
}

async function backfill() {
  // Delete all existing penalties so we can re-scrape with side data
  const deleted = await prisma.penalty.deleteMany({})
  console.log(`Deleted ${deleted.count} existing penalty records`)

  const allGames = await prisma.game.findMany({
    select: { id: true, hockeytechId: true },
    orderBy: { hockeytechId: 'asc' }
  })

  console.log(`Re-scraping penalties for ${allGames.length} games`)

  let updated = 0
  let noPenalties = 0

  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i]
    const penalties = await scrapePenalties(game.hockeytechId)

    if (penalties.length > 0) {
      await prisma.penalty.createMany({
        data: penalties.map(p => ({
          gameId: game.id,
          period: p.period,
          minutes: p.minutes,
          offence: p.offence,
          side: p.side
        }))
      })
      updated++
      const totalPIM = penalties.reduce((sum, p) => sum + p.minutes, 0)
      console.log(`[${i + 1}/${allGames.length}] Game ${game.hockeytechId}: ${penalties.length} penalties, ${totalPIM} PIM`)
    } else {
      noPenalties++
      console.log(`[${i + 1}/${allGames.length}] Game ${game.hockeytechId}: No penalties`)
    }

    if (i % 5 === 4) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log(`\nDone! Games with penalties: ${updated}, Games without: ${noPenalties}`)
  await prisma.$disconnect()
}

backfill().catch(console.error)
