import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import GameHistoryTable from '@/app/components/GameHistoryTable'
import AnimatedCounter from '@/app/components/AnimatedCounter'
import OfficialTeams from '@/app/components/OfficialTeams'
import OfficialPenalties from '@/app/components/OfficialPenalties'

const teamCityMap: Record<string, string> = {
  'Alberni Valley Bulldogs': 'Alberni Valley',
  'Brooks Bandits': 'Brooks',
  'Chilliwack Chiefs': 'Chilliwack',
  'Coquitlam Express': 'Coquitlam',
  'Cowichan Valley Capitals': 'Cowichan Valley',
  'Cranbrook Bucks': 'Cranbrook',
  'Langley Rivermen': 'Langley',
  'Merritt Centennials': 'Merritt',
  'Nanaimo Clippers': 'Nanaimo',
  'Okotoks Oilers': 'Okotoks',
  'Penticton Vees': 'Penticton',
  'Powell River Kings': 'Powell River',
  'Prince George Spruce Kings': 'Prince George',
  'Salmon Arm Silverbacks': 'Salmon Arm',
  'Sherwood Park Crusaders': 'Sherwood Park',
  'Surrey Eagles': 'Surrey',
  'Trail Smoke Eaters': 'Trail',
  'Vernon Vipers': 'Vernon',
  'Victoria Grizzlies': 'Victoria',
  'Wenatchee Wild': 'Wenatchee',
  'West Kelowna Warriors': 'West Kelowna',
  'Spruce Grove Saints': 'Spruce Grove',
}

function getCity(teamName: string) {
  return teamCityMap[teamName] || teamName
}

function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hrs}h ${mins}m`
}

function getOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  const suffix = s[(v - 20) % 10] || s[v] || s[0]
  return (
    <>
      {n}<span className="text-[8px] mt-[2px]">{suffix}</span>
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
  duration: number | null
  homePIM: number
  awayPIM: number
}

interface GameDurationGame {
  duration: number
  date: string
  homeTeam: string
  awayTeam: string
  hockeytechId: number
}

interface GameDurationStats {
  avgDuration: number | null
  longestGame: GameDurationGame | null
  shortestGame: GameDurationGame | null
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
  topTeams: { name: string; count: number; pim: number }[]
  gameDurationStats: GameDurationStats
  penaltyStats: {
    totalPIM: number
    minors: number
    majors: number
    matches: number
    misconducts: number
    fights: number
    instigators: number
    aggressors: number
    faceoffViolations: number
    topPenalties: { offence: string; count: number }[]
  }
  games: GameDetails[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalGames: number
  }
}

async function getOfficial(id: string): Promise<OfficialDetails> {
  // Get the host from request headers for proper URL construction
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  const res = await fetch(`${baseUrl}/api/officials/${id}?page=1&limit=50`, {
    next: { revalidate: 60 } // Cache for 60 seconds
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
    <main className="min-h-screen bg-black pt-28 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-black rounded-lg shadow">
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
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="bg-orange-600 rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-orange-600">
              <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div className="text-lg uppercase font-black italic text-white">Total Games</div>
                {official.totalGamesRank && (
                <div className="text-xs uppercase font-bold italic text-orange-600 bg-white flex justify-center items-center px-3 h-6 rounded-full mt-1 md:mt-0">
                  {getOrdinal(official.totalGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.totalGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white mt-auto"
              />
            </div>
            <div className="bg-white rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-white">
              <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div className="text-lg uppercase font-black italic text-black">
                  <span className="md:inline">As Referee</span>
                </div>
                {official.refereeGamesRank && (
                <div className="text-xs uppercase font-bold italic text-white bg-black flex justify-center items-center px-3 h-6 rounded-full mt-1 md:mt-0">
                  {getOrdinal(official.refereeGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.refereeGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-black mt-auto"
              />
            </div>
            <div className="bg-black rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-white">
              <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <div className="text-lg uppercase font-black italic text-white">
                  <span className="md:hidden">As Lines</span>
                  <span className="hidden md:inline">As Linesperson</span>
                </div>
                {official.linespersonGamesRank && (
                <div className="text-xs uppercase font-bold italic text-black bg-white flex justify-center items-center px-3 h-6 rounded-full mt-1 md:mt-0">
                  {getOrdinal(official.linespersonGamesRank)}
                </div>
              )}
              </div>
              <AnimatedCounter
                value={official.linespersonGames}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white mt-auto"
              />
            </div>
          </div>

          {official.topTeams?.length > 0 && (
            <OfficialTeams teams={official.topTeams} />
          )}

          {official.penaltyStats?.totalPIM > 0 && (
            <OfficialPenalties
              totalPIM={official.penaltyStats.totalPIM}
              minors={official.penaltyStats.minors}
              majors={official.penaltyStats.majors}
              matches={official.penaltyStats.matches}
              misconducts={official.penaltyStats.misconducts}
              fights={official.penaltyStats.fights}
              instigators={official.penaltyStats.instigators}
              aggressors={official.penaltyStats.aggressors}
              faceoffViolations={official.penaltyStats.faceoffViolations}
              topPenalties={official.penaltyStats.topPenalties}
            />
          )}
        </div>

        {official.gameDurationStats?.avgDuration && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Game Duration</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 flex flex-col bg-white rounded-lg">
                  <div className="text-lg uppercase font-black italic text-black">Average</div>
                  <div className="text-4xl font-black italic text-black">
                    {formatDuration(official.gameDurationStats.avgDuration)}
                  </div>
                </div>
                {official.gameDurationStats.longestGame && (
                  <div className="p-4 flex flex-col rounded-lg border-4 border-white">
                    <div className="text-lg uppercase font-black italic text-white">Longest</div>
                    <div className="text-4xl font-black italic text-white">
                      {formatDuration(official.gameDurationStats.longestGame.duration)}
                    </div>
                    <div className="text-sm text-white/70 mt-2">
                      {getCity(official.gameDurationStats.longestGame.awayTeam)} @ {getCity(official.gameDurationStats.longestGame.homeTeam)}
                    </div>
                    <div className="text-sm text-white/50">
                      {new Date(official.gameDurationStats.longestGame.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
                {official.gameDurationStats.shortestGame && (
                  <div className="p-4 flex flex-col rounded-lg border-4 border-white">
                    <div className="text-lg uppercase font-black italic text-white">Shortest</div>
                    <div className="text-4xl font-black italic text-white">
                      {formatDuration(official.gameDurationStats.shortestGame.duration)}
                    </div>
                    <div className="text-sm text-white/70 mt-2">
                      {getCity(official.gameDurationStats.shortestGame.awayTeam)} @ {getCity(official.gameDurationStats.shortestGame.homeTeam)}
                    </div>
                    <div className="text-sm text-white/50">
                      {new Date(official.gameDurationStats.shortestGame.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        <h2 className="text-2xl font-bold text-white uppercase mb-4 italic mt-12">Game History</h2>
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