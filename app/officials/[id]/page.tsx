import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import GameHistoryTable from '@/app/components/GameHistoryTable'
import AnimatedCounter from '@/app/components/AnimatedCounter'

function getOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  const suffix = s[(v - 20) % 10] || s[v] || s[0]
  return (
    <>
      {n}<span className="text-[8px] mt-[4px]">{suffix}</span>
    </>
  )
}

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
  totalGamesRank: number | null
  refereeGamesRank: number | null
  linespersonGamesRank: number | null
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
  // Use VERCEL_URL for server-side, NEXT_PUBLIC_BASE_URL for client, or localhost as fallback
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/officials/${id}?page=1&limit=50`, {
    cache: 'no-store' // Disable cache to ensure fresh data
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error(`Failed to fetch official: ${res.status}`)
  }

  return res.json()
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const official = await getOfficial(id)

  return {
    title: `${official.name} - BCHL Officiating`,
    description: `View ${official.name}'s game history and statistics. ${official.totalGames} total games (${official.refereeGames} as referee, ${official.linespersonGames} as linesperson).`,
  }
}

export default async function OfficialPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const official = await getOfficial(id)

  return (
    <main className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4">
        {/* <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline mb-6"
        >
          ← Back to Officials
        </Link> */}

        <div className="bg-black rounded-lg shadow mb-16">
          <h1 className="text-8xl font-[zuume] font-bold italic uppercase text-white">{official.name}</h1>
          <div className="mb-6 flex flex-row align-middle items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border-2 flex items-center ${
              official.isActive
                ? 'bg-orange-600 border-orange-600 text-white active-badge-glow'
                : 'bg-gray-700 border-gray-700 text-gray-300'
            }`}>
              {official.isActive && <span className="pulse-dot"></span>}
              {official.isActive ? 'Active' : 'Inactive'}
            </span>
            {official.isOriginal57 ? (
              <a href="https://bchl.ca/bchl-announces-officiating-staff-for-2023-24-season" 
                target="_blank" 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-black text-white border-2 border-white hover:bg-orange-600 hover:border-orange-600 hover:scale-90 duration-300">
                OG
              </a>
            ) : null}
            <a href="https://bchl.ca/bchl-officiating-team" 
              target="_blank" 
              className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border-2 border-white text-black hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-90 duration-300">BCHL</a>
            {official.isAhl ? (
              <a href="https://theahl.com/on-ice-officials" 
                target="_blank" 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border-2 border-white text-black hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-90 duration-300">
                AHL
              </a>
            ) : null}
            {official.isPwhl ? (
              <a href="https://www.thepwhl.com/en/news/2025/november/14/pwhl-announces-officiating-leadership-department-and-team-rule-changes-for-2025-26-season" 
                target="_blank" 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border-2 border-white text-black hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-90 duration-300">
                PWHL
              </a>
            ) : null}
            {official.isEchl ? (
              <a href="https://echl.com/about/officials" 
                target="_blank" 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border-2 border-white text-black hover:bg-orange-600 hover:border-orange-600 hover:text-white hover:scale-90 duration-300">
                ECHL
              </a>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-600 rounded-lg p-4">
              <div className="flex flex-row justify-between items-center">
                <div className="text-lg uppercase font-black italic text-white">Total Games</div>
                {official.totalGamesRank && (
                <div className="text-xs uppercase font-bold italic text-orange-600 bg-white flex justify-center items-center px-3 h-6 rounded-full">
                  {getOrdinal(official.totalGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.totalGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white"
              />
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex flex-row justify-between items-center">
                <div className="text-lg uppercase font-black italic text-black">As Referee</div>
                {official.refereeGamesRank && (
                <div className="text-xs uppercase font-bold italic text-white bg-black flex justify-center items-center px-3 h-6 rounded-full">
                  {getOrdinal(official.refereeGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.refereeGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-black"
              />
            </div>
            <div className="bg-black rounded-lg p-4 border-4 border-white">
              <div className="flex flex-row justify-between items-center">
                <div className="text-lg uppercase font-black italic text-white">As Linesperson</div>
                {official.linespersonGamesRank && (
                <div className="text-xs uppercase font-bold italic text-black bg-white flex justify-center items-center px-3 h-6 rounded-full">
                  {getOrdinal(official.linespersonGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.linespersonGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white"
              />
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