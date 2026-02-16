export interface ScrapedPenalty {
  period: string
  minutes: number
  offence: string
  side: 'home' | 'away' | null
}

export interface ScrapedGame {
  hockeytechId: number
  date: string
  location: string
  startTime: string | null
  endTime: string | null
  homeTeam: string
  awayTeam: string
  referees: string[]
  linespeople: string[]
  penalties: ScrapedPenalty[]
}

export interface ScraperResult {
  success: boolean
  game?: ScrapedGame
  error?: string
}
