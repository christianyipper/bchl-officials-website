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
    <div className="">
      <div className="flex gap-2 flex-wrap">
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
