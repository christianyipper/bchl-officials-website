'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface SeasonTabsProps {
  seasons: string[]
  currentSeason?: string
}

export default function SeasonTabs({ seasons, currentSeason }: SeasonTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Default to 2025-26 season if no season is specified
  const activeSeason = currentSeason || searchParams.get('season') || '2025-26'

  const handleSeasonChange = (season: string) => {
    if (season === 'all') {
      router.push('/?season=all')
    } else {
      router.push(`/?season=${season}`)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 flex-wrap">
        {seasons.map((season) => (
          <button
            key={season}
            onClick={() => handleSeasonChange(season)}
            className={`px-4 py-2 font-black uppercase text-sm transition-colors duration-300 ${
              activeSeason === season
                ? 'bg-orange-600 text-white'
                : 'bg-[#1E1E1E] text-white hover:bg-orange-600'
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
              : 'bg-[#1E1E1E] text-white hover:bg-orange-600'
          }`}
        >
          All Time
        </button>
      </div>
    </div>
  )
}
