import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.gameOfficial.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { role } = await request.json()
  const updated = await prisma.gameOfficial.update({
    where: { id },
    data: { role },
    include: { official: true }
  })
  return NextResponse.json({
    id: updated.id,
    officialId: updated.officialId,
    name: updated.official.name,
    role: updated.role
  })
}
