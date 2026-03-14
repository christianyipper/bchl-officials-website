import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Returns a flat JSON array of official stats for the given season (or all-time).
// Designed for Google Sheets IMPORTJSON and After Effects data-driven animation.
//
// Usage:
//   All-time:      /api/export
//   Single season: /api/export?season=2025-26
//   As CSV:        /api/export?format=csv
//   As CSV+season: /api/export?season=2025-26&format=csv

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const season = searchParams.get('season') || null
  const format = searchParams.get('format') || 'json'

  const seasonFilter = season ? { game: { season } } : {}

  const officials = await prisma.official.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      original57: true,
      r_num: true,
      l_num: true,
      games: {
        where: seasonFilter,
        select: { role: true }
      }
    }
  })

  const rows = officials
    .map(o => ({
      name: o.name,
      total_games: o.games.length,
      referee_games: o.games.filter(g => g.role === 'referee').length,
      linesperson_games: o.games.filter(g => g.role === 'linesperson').length,
      original57: o.original57,
      r_num: o.r_num ?? '',
      l_num: o.l_num ?? '',
    }))
    .filter(o => o.total_games > 0)
    .sort((a, b) => b.total_games - a.total_games)
    .map((o, i) => ({ rank: i + 1, ...o }))

  if (format === 'csv') {
    const header = 'rank,name,total_games,referee_games,linesperson_games,original57,r_num,l_num'
    const lines = rows.map(r =>
      `${r.rank},"${r.name}",${r.total_games},${r.referee_games},${r.linesperson_games},${r.original57},${r.r_num},${r.l_num}`
    )
    return new Response([header, ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }

  return NextResponse.json(rows, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
}
