import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: return all officials with game counts, grouped by normalized name to surface duplicates
export async function GET() {
  const officials = await prisma.official.findMany({
    include: { _count: { select: { games: true } } },
    orderBy: { name: 'asc' }
  })

  // Group by normalized name (lowercase, collapse whitespace)
  const groups = new Map<string, typeof officials>()
  for (const o of officials) {
    const key = o.name.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(o)
  }

  // Return duplicates first, then the rest
  const duplicates = [...groups.values()].filter(g => g.length > 1)
  const all = officials.map(o => ({
    id: o.id,
    name: o.name,
    gameCount: o._count.games
  }))

  return NextResponse.json({
    duplicates: duplicates.map(group => group.map(o => ({ id: o.id, name: o.name, gameCount: o._count.games }))),
    all
  })
}

// POST: merge source into target — reassign all games then delete source
export async function POST(request: Request) {
  const { targetId, sourceId } = await request.json()

  if (targetId === sourceId) {
    return NextResponse.json({ error: 'Cannot merge an official with themselves' }, { status: 400 })
  }

  // Get all game assignments for the source official
  const sourceGames = await prisma.gameOfficial.findMany({
    where: { officialId: sourceId }
  })

  // For each source game, try to reassign to target
  // If target already has an assignment for that game, just delete the source record
  for (const sg of sourceGames) {
    const conflict = await prisma.gameOfficial.findUnique({
      where: { gameId_officialId: { gameId: sg.gameId, officialId: targetId } }
    })
    if (conflict) {
      await prisma.gameOfficial.delete({ where: { id: sg.id } })
    } else {
      await prisma.gameOfficial.update({
        where: { id: sg.id },
        data: { officialId: targetId }
      })
    }
  }

  // Delete the source official
  await prisma.official.delete({ where: { id: sourceId } })

  const target = await prisma.official.findUnique({
    where: { id: targetId },
    include: { _count: { select: { games: true } } }
  })

  return NextResponse.json({
    ok: true,
    merged: { id: target!.id, name: target!.name, gameCount: target!._count.games }
  })
}
