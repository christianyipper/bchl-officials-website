'use client'

import { useState } from 'react'
import OfficialsTable from './OfficialsTable'
import SeasonTabs from './SeasonTabs'

interface OfficialSummary {
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
}

interface OfficialsPageClientProps {
  officials: OfficialSummary[]
  seasons: string[]
  currentSeason?: string
}

export default function OfficialsPageClient({ officials, seasons, currentSeason }: OfficialsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      {/* Season Tabs and Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <SeasonTabs seasons={seasons} currentSeason={currentSeason} />

        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-bchl-navy border-2 border-gray-500 text-white placeholder-gray-500 focus:outline-none focus:border-orange-600 transition-colors duration-300 font-medium text-sm w-64"
        />
      </div>

      <OfficialsTable officials={officials} searchQuery={searchQuery} />
    </>
  )
}
