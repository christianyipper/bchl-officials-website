import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const officials = await prisma.official.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })
  return NextResponse.json(officials)
}
