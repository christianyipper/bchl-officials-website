'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface SeasonTabsProps {
  seasons: string[]
  currentSeason?: string
}

export default function SeasonTabs({ seasons, currentSeason }: SeasonTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  // Default to 2025-26 season if no season is specified
  const activeSeason = currentSeason || searchParams.get('season') || '2025-26'

  const handleSeasonChange = (season: string) => {
    if (season === 'all') {
      router.push(`${pathname}?season=all`)
    } else {
      router.push(`${pathname}?season=${season}`)
    }
  }

  return (
    <div>
      {/* Mobile: dropdown */}
      <div className="md:hidden relative inline-block">
        <select
          value={activeSeason}
          onChange={(e) => handleSeasonChange(e.target.value)}
          className="px-4 pr-10 py-2 bg-orange-600 text-white font-black uppercase text-sm appearance-none cursor-pointer focus:outline-none"
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season} Season
            </option>
          ))}
          <option value="all">All Time</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Desktop: buttons */}
      <div className="hidden md:flex gap-2 flex-wrap">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => handleSeasonChange(season)}
            className={`px-4 py-2 font-black uppercase text-sm transition-colors duration-300 ${
              activeSeason === season
                ? 'bg-orange-600 text-white'
                : 'bg-white text-black hover:bg-orange-600 hover:text-white'
            }`}
          >
            {season} Season
          </button>
        ))}
        <button
          onClick={() => handleSeasonChange('all')}
          className={`px-4 py-2 font-black uppercase text-sm transition-colors duration-300 ${
            activeSeason === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-black hover:bg-orange-600 hover:text-white'
          }`}
        >
          All Time
        </button>
      </div>
    </div>
  )
}
