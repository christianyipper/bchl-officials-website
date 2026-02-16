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

interface TeamData {
  name: string
  count: number
  pim: number
  topPenalties: { offence: string; count: number }[]
}

interface OfficialTeamsProps {
  teams: TeamData[]
}

export default function OfficialTeams({ teams }: OfficialTeamsProps) {
  const [expanded, setExpanded] = useState(false)

  if (teams.length === 0) return null

  const half = Math.ceil(teams.length / 2)
  const leftCol = teams.slice(0, half)
  const rightCol = teams.slice(half)

  // Compute global max for PIM and each offence across all teams
  const maxPIM = Math.max(...teams.map(t => t.pim), 1)
  const maxByOffence: Record<string, number> = {}
  for (const team of teams) {
    for (const p of team.topPenalties) {
      maxByOffence[p.offence] = Math.max(maxByOffence[p.offence] || 0, p.count)
    }
  }

  const renderRow = (team: TeamData) => {
    return (
      <div key={team.name} className="flex flex-col gap-1 mb-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-white uppercase whitespace-nowrap">{getCity(team.name)}</span>
          <div className="w-full h-[2px] bg-gray-400"></div>
          <span className="text-sm font-bold text-gray-400 relative flex flex-row gap-1">{team.count} <span className="text-[10px] uppercase">GP</span></span>
        </div>
        <div className="flex flex-row gap-3 bg-bchl-navy p-2 rounded-md">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 truncate">PIM</span>
              <span className="text-xs font-bold text-gray-400 ml-1">{team.pim}</span>
            </div>
            <div className="bg-black rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-600 h-full rounded-full"
                style={{ width: `${(team.pim / maxPIM) * 100}%` }}
              />
            </div>
          </div>
          {team.topPenalties.map(p => (
            <div key={p.offence} className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 truncate">{p.offence}</span>
                <span className="text-xs font-bold text-gray-400 ml-1">{p.count}</span>
              </div>
              <div className="bg-black rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full"
                  style={{ width: `${(p.count / (maxByOffence[p.offence] || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const mobileTeams = expanded ? teams : teams.slice(0, 5)

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Officiated Teams</h2>

      {/* Mobile: single column with expand */}
      <div className="md:hidden flex flex-col gap-1">
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
      <div className="hidden md:grid md:grid-cols-2 gap-y-0 md:divide-x md:divide-[#1b263d]">
        <div className="flex flex-col pr-8">
          {leftCol.map(renderRow)}
        </div>
        <div className="flex flex-col pl-8">
          {rightCol.map(renderRow)}
        </div>
      </div>
    </div>
  )
}
