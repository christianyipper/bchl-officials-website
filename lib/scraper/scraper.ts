import axios from 'axios'
import * as cheerio from 'cheerio'
import { ScrapedGame, ScraperResult } from './types'

const BASE_URL = 'https://lscluster.hockeytech.com/game_reports/official-game-report.php'
const CLIENT_CODE = 'bchl'
const LANG_ID = 1

export async function scrapeGameReport(gameId: number): Promise<ScraperResult> {
  try {
    const url = `${BASE_URL}?client_code=${CLIENT_CODE}&game_id=${gameId}&lang_id=${LANG_ID}`

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)

    // Check if this is a valid game report by looking for key elements
    const bodyText = $('body').text()

    if (bodyText.includes('Invalid') || bodyText.includes('not found') || bodyText.length < 100) {
      return {
        success: false,
        error: 'Invalid game ID or game not found'
      }
    }

    // Extract game information using text patterns
    const date = extractField(bodyText, /Date:\s*([A-Za-z]+\s+\d+,\s+\d{4})/)
    const location = extractField(bodyText, /PLAYED AT:\s*([^\n]+)/)
    const homeTeam = extractField(bodyText, /Home Team:\s*([^\n]+)/)
    const awayTeam = extractField(bodyText, /Visiting Team:\s*([^\n]+)/)
    const startTime = extractField(bodyText, /Start:\s*(\d{1,2}:\d{2}\s*[AP]M)/)
    const endTime = extractField(bodyText, /End:\s*(\d{1,2}:\d{2}\s*[AP]M)/)

    // Extract officials
    const officials = extractOfficials(bodyText)

    if (!date || !location || !homeTeam || !awayTeam) {
      return {
        success: false,
        error: 'Could not extract all required game information'
      }
    }

    const game: ScrapedGame = {
      hockeytechId: gameId,
      date,
      location: location.trim(),
      startTime: startTime ? startTime.trim() : null,
      endTime: endTime ? endTime.trim() : null,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      referees: officials.referees,
      linespeople: officials.linespeople
    }

    return {
      success: true,
      game
    }
  } catch (error) {
    console.error(`Error scraping game ${gameId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function extractField(text: string, regex: RegExp): string | null {
  const match = text.match(regex)
  return match ? match[1].trim() : null
}

function extractOfficials(text: string): { referees: string[], linespeople: string[] } {
  const referees: string[] = []
  const linespeople: string[] = []

  // Match all "Referee:" lines
  const refMatches = text.matchAll(/Referee:\s*([^\n]+)/gi)
  for (const match of refMatches) {
    const name = match[1].replace(/\s*\(\d+\)\s*$/, '').trim()
    if (name) {
      referees.push(name)
    }
  }

  // Match all "Linesmen:" or "Linesman:" lines
  const linesmenMatches = text.matchAll(/Lines(?:man|men):\s*([^\n]+)/gi)
  for (const match of linesmenMatches) {
    const name = match[1].replace(/\s*\(\d+\)\s*$/, '').trim()
    if (name) {
      linespeople.push(name)
    }
  }

  return { referees, linespeople }
}

export async function testGameId(gameId: number): Promise<boolean> {
  const result = await scrapeGameReport(gameId)
  return result.success
}
