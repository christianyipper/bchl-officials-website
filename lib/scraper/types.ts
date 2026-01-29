export interface ScrapedGame {
  hockeytechId: number
  date: string
  location: string
  homeTeam: string
  awayTeam: string
  referees: string[]
  linespeople: string[]
}

export interface ScraperResult {
  success: boolean
  game?: ScrapedGame
  error?: string
}
