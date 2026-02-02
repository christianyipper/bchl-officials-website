import { NextRequest, NextResponse } from 'next/server'
import { scrapeGameReport } from '@/lib/scraper/scraper'
import { discoverGameIds } from '@/lib/scraper/game-id-discovery'
import { scrapeAndSaveGames } from '@/lib/scraper/save-to-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, gameId, startId, endId, concurrency } = body

    switch (action) {
      case 'scrape-single':
        if (!gameId) {
          return NextResponse.json(
            { error: 'gameId is required for scrape-single action' },
            { status: 400 }
          )
        }
        const result = await scrapeGameReport(gameId)
        return NextResponse.json(result)

      case 'discover':
        if (!startId || !endId) {
          return NextResponse.json(
            { error: 'startId and endId are required for discover action' },
            { status: 400 }
          )
        }
        const discoveryResult = await discoverGameIds(
          startId,
          endId,
          concurrency || 5
        )
        return NextResponse.json(discoveryResult)

      case 'scrape-and-save':
        if (!body.gameIds || !Array.isArray(body.gameIds)) {
          return NextResponse.json(
            { error: 'gameIds array is required for scrape-and-save action' },
            { status: 400 }
          )
        }
        const saveResults = await scrapeAndSaveGames(body.gameIds)
        return NextResponse.json(saveResults)

      case 'discover-and-save':
        if (!startId || !endId) {
          return NextResponse.json(
            { error: 'startId and endId are required for discover-and-save action' },
            { status: 400 }
          )
        }
        const discovery = await discoverGameIds(startId, endId, concurrency || 5)
        const results = await scrapeAndSaveGames(discovery.found)
        return NextResponse.json({
          discovery,
          results
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: scrape-single, discover, scrape-and-save, or discover-and-save' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in scrape API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
