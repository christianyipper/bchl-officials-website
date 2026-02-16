'use client'

import { useState } from 'react'

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

interface OfficialTeamsProps {
  teams: { name: string; count: number; pim: number }[]
}

export default function OfficialTeams({ teams }: OfficialTeamsProps) {
  const [expanded, setExpanded] = useState(false)

  if (teams.length === 0) return null

  const maxCount = teams[0].count
  const half = Math.ceil(teams.length / 2)
  const leftCol = teams.slice(0, half)
  const rightCol = teams.slice(half)

  const renderRow = (team: { name: string; count: number; pim: number }) => (
    <div key={team.name} className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{getCity(team.name)}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{team.pim} PIM</span>
          <span className="text-sm font-bold text-gray-400">{team.count}</span>
        </div>
      </div>
      <div className="bg-[#1b263d] rounded-full h-2 overflow-hidden">
        <div
          className="bg-orange-600 h-full rounded-full"
          style={{ width: `${(team.count / maxCount) * 100}%` }}
        />
      </div>
    </div>
  )

  const mobileTeams = expanded ? teams : teams.slice(0, 5)

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Officiated Teams</h2>

      {/* Mobile: single column with expand */}
      <div className="md:hidden flex flex-col gap-3">
        {mobileTeams.map(renderRow)}
        {teams.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-2 text-left"
          >
            {expanded ? 'Show less' : `Show all ${teams.length} teams`}
          </button>
        )}
      </div>

      {/* Desktop: two columns */}
      <div className="hidden md:grid md:grid-cols-2 gap-y-2 md:divide-x md:divide-[#1b263d]">
        <div className="flex flex-col gap-3 pr-12">
          {leftCol.map(renderRow)}
        </div>
        <div className="flex flex-col gap-3 pl-12">
          {rightCol.map(renderRow)}
        </div>
      </div>
    </div>
  )
}
