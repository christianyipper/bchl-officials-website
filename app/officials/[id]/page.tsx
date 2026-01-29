import Link from 'next/link'
import { notFound } from 'next/navigation'
import GameHistoryTable from '@/app/components/GameHistoryTable'

interface GameDetails {
  id: string
  hockeytechId: number
  date: string
  location: string
  homeTeam: string
  awayTeam: string
  role: string
}

interface OfficialDetails {
  id: string
  name: string
  totalGames: number
  refereeGames: number
  linespersonGames: number
  isActive: boolean
  isOriginal57: boolean
  isAhl: boolean
  isEchl: boolean
  isPwhl: boolean
  games: GameDetails[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalGames: number
  }
}

async function getOfficial(id: string): Promise<OfficialDetails> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/officials/${id}?page=1&limit=50`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch official')
  }

  return res.json()
}

export default async function OfficialPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const official = await getOfficial(id)

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline mb-6"
        >
          ← Back to Officials
        </Link>

        <div className="bg-black rounded-lg shadow p-6 mb-8">
          <h1 className="text-8xl font-[zuume] font-bold italic uppercase text-white">{official.name}</h1>
          <div className="mb-6 flex flex-row align-middle items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              official.isActive
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {official.isActive ? 'Active' : 'Inactive'}
            </span>
            {official.isOriginal57 ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-700 text-amber-400">
                Original 57
              </span>
            ) : null}
            <p className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#00385e] text-[#1b91ff]">BCHL</p>
            {official.isAhl ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#450000] text-red-500">
                AHL
              </span>
            ) : null}
            {official.isEchl ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#450000] text-red-500">
                ECHL
              </span>
            ) : null}
            {official.isPwhl ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#310884] text-[#8244ff]">
                PWHL
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0b4000] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">Total Games</div>
              <div className="text-4xl font-black italic text-green-400">{official.totalGames}</div>
            </div>
            <div className="bg-[#4d3200] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">As Referee</div>
              <div className="text-4xl font-black italic text-orange-400">{official.refereeGames}</div>
            </div>
            <div className="bg-[#002d4d] rounded-lg p-4">
              <div className="text-lg uppercase font-black italic text-white">As Linesperson</div>
              <div className="text-4xl font-black italic text-blue-400">
                {official.linespersonGames}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white uppercase mb-4">Game History</h2>
        <GameHistoryTable
          officialId={official.id}
          initialGames={official.games}
          initialPage={official.pagination.page}
          totalPages={official.pagination.totalPages}
          totalGames={official.pagination.totalGames}
        />
      </div>
    </main>
  )
}
