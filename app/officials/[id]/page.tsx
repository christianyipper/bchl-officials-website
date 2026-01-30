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
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center ${
              official.isActive
                ? 'bg-orange-600 text-white active-badge-glow'
                : 'bg-gray-700 text-gray-300'
            }`}>
              {official.isActive && <span className="pulse-dot"></span>}
              {official.isActive ? 'Active' : 'Inactive'}
            </span>
            {official.isOriginal57 ? (
              <a href="https://bchl.ca/bchl-announces-officiating-staff-for-2023-24-season" target="_blank" className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#a65b00] text-amber-400 border border-amber-400 shadow-glow-amber hover:scale-90 duration-300">
                OG:57
              </a>
            ) : null}
            <a href="https://bchl.ca/bchl-officiating-team" target="_blank" className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#00385e] text-[#2bbbfd] hover:scale-90 duration-300">BCHL</a>
            {official.isAhl ? (
              <a href="https://theahl.com/on-ice-officials" target="_blank" className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#550000] text-[#ff3838] hover:scale-90 duration-300">
                AHL
              </a>
            ) : null}
            {official.isEchl ? (
              <a href="https://echl.com/about/officials" target="_blank" className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#550000] text-[#ff3838] hover:scale-90 duration-300">
                ECHL
              </a>
            ) : null}
            {official.isPwhl ? (
              <a href="https://www.thepwhl.com/en/news/2025/november/14/pwhl-announces-officiating-leadership-department-and-team-rule-changes-for-2025-26-season" target="_blank" className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#35098e] text-[#ad65ff] hover:scale-90 duration-300">
                PWHL
              </a>
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