import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { gameId, officialId, role } = await request.json()

  const existing = await prisma.gameOfficial.findUnique({
    where: { gameId_officialId: { gameId, officialId } }
  })
  if (existing) {
    return NextResponse.json({ error: 'Official already assigned to this game' }, { status: 400 })
  }

  const gameOfficial = await prisma.gameOfficial.create({
    data: { gameId, officialId, role },
    include: { official: true }
  })

  return NextResponse.json({
    id: gameOfficial.id,
    officialId: gameOfficial.officialId,
    name: gameOfficial.official.name,
    role: gameOfficial.role
  })
}
