import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import GameHistoryTable from '@/app/components/GameHistoryTable'
import AnimatedCounter from '@/app/components/AnimatedCounter'
import OfficialTeams from '@/app/components/OfficialTeams'
import OfficialPenalties from '@/app/components/OfficialPenalties'
import SeasonTabs from '@/app/components/SeasonTabs'
import Sparkline from '@/app/components/Sparkline'

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

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getChemistryLabels(periods: string[], useWeekly: boolean): string[] {
  if (!useWeekly) {
    // All-time: periods are season keys like "2024-25"
    return periods.map(p => {
      const parts = p.split('-')
      return `${parts[0].slice(2)}/${parts[1]}`
    })
  }
  // Per-season: weekly periods, use month labels
  let lastMonth = -1
  return periods.map(p => {
    const year = parseInt(p.split('-')[0], 10)
    const week = parseInt(p.split('W')[1], 10)
    const jan4 = new Date(year, 0, 4)
    const d = new Date(jan4.getTime() + (week - 1) * 7 * 86400000)
    const month = d.getMonth()
    if (month !== lastMonth) {
      lastMonth = month
      return MONTH_ABBR[month]
    }
    return ''
  })
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
  activeSeasons: string[]
  isOriginal57: boolean
  isAhl: boolean
  isEchl: boolean
  isPwhl: boolean
  topTeams: { name: string; count: number; pim: number; topPenalties: { offence: string; count: number }[] }[]
  gameDurationStats: GameDurationStats
  penaltyStats: {
    totalPIM: number
    minors: number
    majors: number
    matches: number
    misconducts: number
    gameMisconducts: number
    fights: number
    instigators: number
    aggressors: number
    faceoffViolations: number
    minorsRank: number | null
    majorsRank: number | null
    matchesRank: number | null
    misconductsRank: number | null
    gameMisconductsRank: number | null
    fightsRank: number | null
    instigatorsRank: number | null
    aggressorsRank: number | null
    faceoffViolationsRank: number | null
    topPenalties: { offence: string; count: number }[]
  }
  teamChemistry: {
    topReferees: { id: string; name: string; games: number; timeline: number[] }[]
    topLinespeople: { id: string; name: string; games: number; timeline: number[] }[]
    periods: string[]
  }
  gamesTimeline: { period: string; total: number; referee: number; linesperson: number }[]
  useWeekly: boolean
  games: GameDetails[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalGames: number
  }
}

async function getBaseUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

async function getOfficial(id: string, season?: string): Promise<OfficialDetails> {
  const baseUrl = await getBaseUrl()
  const seasonParam = season ? `&season=${season}` : ''

  const res = await fetch(`${baseUrl}/api/officials/${id}?page=1&limit=50${seasonParam}`, {
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    if (res.status === 404) {
      notFound()
    }
    throw new Error(`Failed to fetch official: ${res.status}`)
  }

  return res.json()
}

async function getSeasons(): Promise<string[]> {
  const baseUrl = await getBaseUrl()
  const res = await fetch(`${baseUrl}/api/seasons`, {
    next: { revalidate: 300 }
  })
  if (!res.ok) return []
  return res.json()
}

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ season?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { season } = await searchParams
  const selectedSeason = season && season !== 'all' ? season : undefined
  const official = await getOfficial(id, selectedSeason)

  return {
    title: `${official.name} - BCHL Officiating`,
    description: `View ${official.name}'s game history and statistics. ${official.totalGames} total games (${official.refereeGames} as referee, ${official.linespersonGames} as linesperson).`,
  }
}

export default async function OfficialPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ season?: string }>
}) {
  const { id } = await params
  const { season } = await searchParams
  const selectedSeason = season && season !== 'all' ? season : undefined
  const official = await getOfficial(id, selectedSeason)
  const allSeasons = await getSeasons()
  const seasons = allSeasons.filter(s => official.activeSeasons.includes(s))
  const currentSeason = season || 'all'

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
          <div className="mb-6">
            <SeasonTabs seasons={seasons} currentSeason={currentSeason} />
          </div>
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="relative bg-orange-600 rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-orange-600 overflow-hidden">
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
                className="text-4xl font-black italic text-white relative z-10"
              />
              <Sparkline data={official.gamesTimeline.map(t => t.total)} color="white" className="absolute right-0 bottom-0 w-[80%] h-12" />
            </div>
            <div className="relative bg-white rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-white overflow-hidden">
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
                className="text-4xl font-black italic text-black relative z-10"
              />
              <Sparkline data={official.gamesTimeline.map(t => t.referee)} color="black" className="absolute right-0 bottom-0 w-[80%] h-12" />
            </div>
            <div className="relative bg-black rounded-lg px-4 py-2 flex flex-col w-full h-full border-4 border-white overflow-hidden">
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
                className="text-4xl font-black italic text-white relative z-10"
              />
                <Sparkline data={official.gamesTimeline.map(t => t.linesperson)} color="white" className="absolute right-0 bottom-0 w-[80%] h-12" />
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
              gameMisconducts={official.penaltyStats.gameMisconducts}
              fights={official.penaltyStats.fights}
              instigators={official.penaltyStats.instigators}
              aggressors={official.penaltyStats.aggressors}
              faceoffViolations={official.penaltyStats.faceoffViolations}
              minorsRank={official.penaltyStats.minorsRank}
              majorsRank={official.penaltyStats.majorsRank}
              matchesRank={official.penaltyStats.matchesRank}
              misconductsRank={official.penaltyStats.misconductsRank}
              gameMisconductsRank={official.penaltyStats.gameMisconductsRank}
              fightsRank={official.penaltyStats.fightsRank}
              instigatorsRank={official.penaltyStats.instigatorsRank}
              aggressorsRank={official.penaltyStats.aggressorsRank}
              faceoffViolationsRank={official.penaltyStats.faceoffViolationsRank}
              topPenalties={official.penaltyStats.topPenalties}
            />
          )}
        </div>

        {(official.teamChemistry?.topReferees.length > 0 || official.teamChemistry?.topLinespeople.length > 0) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Chemistry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {official.teamChemistry.topReferees.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase bg-[#1b263d] py-2 px-4">Top Referees</h3>
                  <div className="divide-y divide-[#1b263d]">
                    {official.teamChemistry.topReferees.map((ref, idx) => (
                      <a
                        key={ref.id}
                        href={`/officials/${ref.id}${currentSeason !== 'all' ? `?season=${currentSeason}` : ''}`}
                        className="flex justify-between items-center py-3 px-4 bg-black hover:bg-orange-600 transition-colors duration-300 group"
                      >
                        <span className="text-white font-bold uppercase flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ['#ea580c', '#06b6d4', '#f59e0b', '#84cc16', '#d946ef'][idx] }} />
                          {ref.name}
                        </span>
                        <span className="text-gray-400 group-hover:text-white text-sm font-bold">{ref.games}</span>
                      </a>
                    ))}
                  </div>
                  <Sparkline
                    datasets={official.teamChemistry.topReferees.map((ref, idx) => ({
                      data: ref.timeline,
                      color: ['#ea580c', '#06b6d4', '#f59e0b', '#84cc16', '#d946ef'][idx]
                    }))}
                    labels={getChemistryLabels(official.teamChemistry.periods, official.useWeekly)}
                    className="w-full mt-2"
                  />
                </div>
              )}
              {official.teamChemistry.topLinespeople.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase bg-[#1b263d] py-2 px-4">Top Linespeople</h3>
                  <div className="divide-y divide-[#1b263d]">
                    {official.teamChemistry.topLinespeople.map((lines, idx) => (
                      <a
                        key={lines.id}
                        href={`/officials/${lines.id}${currentSeason !== 'all' ? `?season=${currentSeason}` : ''}`}
                        className="flex justify-between items-center py-3 px-4 bg-black hover:bg-orange-600 transition-colors duration-300 group"
                      >
                        <span className="text-white font-bold uppercase flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ['#ea580c', '#06b6d4', '#f59e0b', '#84cc16', '#d946ef'][idx] }} />
                          {lines.name}
                        </span>
                        <span className="text-gray-400 group-hover:text-white text-sm font-bold">{lines.games}</span>
                      </a>
                    ))}
                  </div>
                  <Sparkline
                    datasets={official.teamChemistry.topLinespeople.map((lines, idx) => ({
                      data: lines.timeline,
                      color: ['#ea580c', '#06b6d4', '#f59e0b', '#84cc16', '#d946ef'][idx]
                    }))}
                    labels={getChemistryLabels(official.teamChemistry.periods, official.useWeekly)}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {official.gameDurationStats?.avgDuration && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Game Duration</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          currentSeason={currentSeason}
        />
      </div>
    </main>
  )
}