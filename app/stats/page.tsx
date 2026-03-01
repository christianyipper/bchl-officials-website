'use client'

import { useState } from 'react'
import Link from 'next/link'

function getDefaultDates() {
  const today = new Date()
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(monthAgo), end: fmt(today) }
}

const TEAMS = [
  'Alberni Valley Bulldogs',
  'Brooks Bandits',
  'Chilliwack Chiefs',
  'Coquitlam Express',
  'Cowichan Valley Capitals',
  'Cranbrook Bucks',
  'Langley Rivermen',
  'Merritt Centennials',
  'Nanaimo Clippers',
  'Okotoks Oilers',
  'Penticton Vees',
  'Powell River Kings',
  'Prince George Spruce Kings',
  'Salmon Arm Silverbacks',
  'Sherwood Park Crusaders',
  'Surrey Eagles',
  'Trail Smoke Eaters',
  'Vernon Vipers',
  'Victoria Grizzlies',
  'Wenatchee Wild',
  'West Kelowna Warriors',
  'Spruce Grove Saints',
].sort()

interface PenaltyStats {
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
  topPenalties: { offence: string; count: number }[]
}

interface StatsResult {
  gameCount: number
  penaltyStats: PenaltyStats
  topReferees: { id: string; name: string; games: number }[]
  topLinespeople: { id: string; name: string; games: number }[]
}

function StatCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className={`${bg} rounded-lg px-4 py-2 flex flex-col w-full`}>
      <div className="text-lg uppercase font-black italic text-white">{label}</div>
      <div className="text-4xl font-black italic text-white mt-auto">{value}</div>
    </div>
  )
}

function StatCardDark({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg px-4 py-2 flex flex-col w-full border-4 border-white">
      <div className="text-lg uppercase font-black italic text-black">{label}</div>
      <div className="text-4xl font-black italic text-black mt-auto">{value}</div>
    </div>
  )
}

export default function StatsPage() {
  const defaults = getDefaultDates()
  const [team, setTeam] = useState('')
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StatsResult | null>(null)
  const [searched, setSearched] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSearched(true)
    setMobileExpanded(false)
    setDesktopExpanded(false)

    const params = new URLSearchParams()
    if (team) params.set('team', team)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)

    try {
      const res = await fetch(`/api/stats?${params}`)
      const data = await res.json()
      setResult(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const ps = result?.penaltyStats

  const maxPenaltyCount = ps?.topPenalties[0]?.count ?? 1
  const displayedPenaltiesMobile = ps ? (mobileExpanded ? ps.topPenalties : ps.topPenalties.slice(0, 5)) : []
  const displayedPenaltiesDesktop = ps ? (desktopExpanded ? ps.topPenalties : ps.topPenalties.slice(0, 12)) : []
  const desktopThird = Math.ceil(displayedPenaltiesDesktop.length / 3)

  const renderPenaltyRow = (penalty: { offence: string; count: number }) => (
    <div key={penalty.offence} className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{penalty.offence}</span>
        <span className="text-sm font-bold text-gray-400">{penalty.count}</span>
      </div>
      <div className="bg-[#1b263d] rounded-full h-2 overflow-hidden">
        <div
          className="bg-orange-600 h-full rounded-full"
          style={{ width: `${(penalty.count / maxPenaltyCount) * 100}%` }}
        />
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black pt-28 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-8xl font-[zuume] font-bold italic uppercase text-white mb-8">Stats</h1>

        {/* Filter form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-12">
          {/* Team */}
          <div className="relative">
            <select
              value={team}
              onChange={e => setTeam(e.target.value)}
              className="h-12 px-4 pr-10 bg-[#1b263d] text-white font-bold uppercase text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-600 w-full md:w-72"
            >
              <option value="">All Teams</option>
              {TEAMS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Start date */}
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="h-12 px-4 bg-[#1b263d] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 w-full md:w-48 [color-scheme:dark]"
          />

          {/* End date */}
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="h-12 px-4 bg-[#1b263d] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-600 w-full md:w-48 [color-scheme:dark]"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 px-8 bg-orange-600 text-white font-black uppercase text-sm hover:bg-orange-500 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {searched && !loading && result && (
          <>
            <div className="text-gray-400 text-sm font-bold uppercase mb-8">
              {result.gameCount} game{result.gameCount !== 1 ? 's' : ''}
              {team ? ` · ${team}` : ' · All Teams'}
              {startDate ? ` · From ${new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
              {endDate ? ` · To ${new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
            </div>

            {/* Infraction Report */}
            {ps && ps.totalPIM > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Infraction Report</h2>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="bg-[#1b263d] rounded-lg px-4 py-2 flex flex-col md:w-48 shrink-0 border-4 border-[#1b263d]">
                    <div className="text-lg uppercase font-black italic text-white">Total PIM</div>
                    <div className="text-4xl font-black italic text-white mt-auto">{ps.totalPIM}</div>
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <div className="grid grid-cols-3 gap-4">
                      <StatCardDark label="Minor" value={ps.minors} />
                      <StatCardDark label="Major" value={ps.majors} />
                      <StatCardDark label="Match" value={ps.matches} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <StatCard label="Misc." value={ps.misconducts} bg="bg-black border-4 border-white" />
                      <StatCard label="Game Misc." value={ps.gameMisconducts} bg="bg-black border-4 border-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Fighting" value={ps.fights} bg="bg-orange-600 border-4 border-orange-600" />
                  <StatCard label="Instigator" value={ps.instigators} bg="bg-orange-600 border-4 border-orange-600" />
                  <StatCard label="Aggressor" value={ps.aggressors} bg="bg-orange-600 border-4 border-orange-600" />
                  <StatCard label="FO Violation" value={ps.faceoffViolations} bg="bg-orange-600 border-4 border-orange-600" />
                </div>

                {ps.topPenalties.length > 0 && (
                  <>
                    {/* Mobile */}
                    <div className="md:hidden flex flex-col gap-3">
                      {displayedPenaltiesMobile.map(renderPenaltyRow)}
                      {ps.topPenalties.length > 5 && (
                        <button onClick={() => setMobileExpanded(!mobileExpanded)} className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-2 text-left">
                          {mobileExpanded ? 'Show less' : `Show all ${ps.topPenalties.length} penalties`}
                        </button>
                      )}
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-3 gap-y-2 divide-x divide-[#1b263d]">
                        <div className="flex flex-col gap-3 pr-8">{displayedPenaltiesDesktop.slice(0, desktopThird).map(renderPenaltyRow)}</div>
                        <div className="flex flex-col gap-3 px-8">{displayedPenaltiesDesktop.slice(desktopThird, desktopThird * 2).map(renderPenaltyRow)}</div>
                        <div className="flex flex-col gap-3 pl-8">{displayedPenaltiesDesktop.slice(desktopThird * 2).map(renderPenaltyRow)}</div>
                      </div>
                      {ps.topPenalties.length > 12 && (
                        <button onClick={() => setDesktopExpanded(!desktopExpanded)} className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-4 text-left">
                          {desktopExpanded ? 'Show less' : `Show all ${ps.topPenalties.length} penalties`}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Top Officials */}
            {(result.topReferees.length > 0 || result.topLinespeople.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Top Officials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.topReferees.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase bg-[#1b263d] py-2 px-4">Top Referees</h3>
                      <div className="divide-y divide-[#1b263d]">
                        {result.topReferees.map((ref, idx) => (
                          <Link
                            key={ref.id}
                            href={`/officials/${ref.id}`}
                            className="flex justify-between items-center py-3 px-4 bg-black hover:bg-orange-600 transition-colors duration-300 group"
                          >
                            <span className="text-white font-bold uppercase flex items-center gap-3">
                              <span className="text-gray-500 group-hover:text-white/70 text-sm w-5 text-right">{idx + 1}</span>
                              {ref.name}
                            </span>
                            <span className="text-gray-400 group-hover:text-white text-sm font-bold">{ref.games}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.topLinespeople.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase bg-[#1b263d] py-2 px-4">Top Linespeople</h3>
                      <div className="divide-y divide-[#1b263d]">
                        {result.topLinespeople.map((lines, idx) => (
                          <Link
                            key={lines.id}
                            href={`/officials/${lines.id}`}
                            className="flex justify-between items-center py-3 px-4 bg-black hover:bg-orange-600 transition-colors duration-300 group"
                          >
                            <span className="text-white font-bold uppercase flex items-center gap-3">
                              <span className="text-gray-500 group-hover:text-white/70 text-sm w-5 text-right">{idx + 1}</span>
                              {lines.name}
                            </span>
                            <span className="text-gray-400 group-hover:text-white text-sm font-bold">{lines.games}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.gameCount === 0 && (
              <p className="text-gray-400 font-bold uppercase">No games found for the selected filters.</p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
