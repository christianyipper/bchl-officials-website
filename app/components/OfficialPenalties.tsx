'use client'

import { useState } from 'react'
import AnimatedCounter from './AnimatedCounter'

interface OfficialPenaltiesProps {
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

export default function OfficialPenalties({ totalPIM, minors, majors, matches, misconducts, fights, instigators, aggressors, faceoffViolations, topPenalties }: OfficialPenaltiesProps) {
  const [expanded, setExpanded] = useState(false)

  if (totalPIM <= 0 || topPenalties.length === 0) return null

  const maxCount = topPenalties[0].count
  const third = Math.ceil(topPenalties.length / 3)
  const col1 = topPenalties.slice(0, third)
  const col2 = topPenalties.slice(third, third * 2)
  const col3 = topPenalties.slice(third * 2)

  const renderRow = (penalty: { offence: string; count: number }) => (
    <div key={penalty.offence} className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">{penalty.offence}</span>
        <span className="text-sm font-bold text-gray-400">{penalty.count}</span>
      </div>
      <div className="bg-[#1b263d] rounded-full h-2 overflow-hidden">
        <div
          className="bg-orange-600 h-full rounded-full"
          style={{ width: `${(penalty.count / maxCount) * 100}%` }}
        />
      </div>
    </div>
  )

  const mobilePenalties = expanded ? topPenalties : topPenalties.slice(0, 5)

  const row1 = [
    { label: 'Minor', value: minors },
    { label: 'Major', value: majors },
    { label: 'Match', value: matches },
    { label: 'Misconduct', value: misconducts },
  ]

  const row2 = [
    { label: 'Fighting', value: fights },
    { label: 'Instigator', value: instigators },
    { label: 'Aggressor', value: aggressors },
    { label: 'FO Violation', shortLabel: 'Faceoff', value: faceoffViolations },
  ]

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Penalties</h2>
      <div className="text-4xl font-black italic text-white mb-4">
        {totalPIM} <span className="text-lg font-bold text-gray-400">PIM</span>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row w-full gap-4">
          {row1.map(stat => (
            <div key={stat.label} className="bg-black rounded-lg px-4 py-2 flex flex-col w-full border-4 border-white">
              <div className="text-lg uppercase font-black italic text-white">{stat.label}</div>
              <AnimatedCounter
                value={stat.value}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white mt-auto"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row w-full gap-4">
          {row2.map(stat => (
            <div key={stat.label} className="bg-black rounded-lg px-4 py-2 flex flex-col w-full border-4 border-white">
              <div className="text-lg uppercase font-black italic text-white">{stat.label}</div>
              <AnimatedCounter
                value={stat.value}
                delay={1200}
                duration={2500}
                className="text-4xl font-black italic text-white mt-auto"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: single column with expand */}
      <div className="md:hidden flex flex-col gap-3">
        {mobilePenalties.map(renderRow)}
        {topPenalties.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-2 text-left"
          >
            {expanded ? 'Show less' : `Show all ${topPenalties.length} penalties`}
          </button>
        )}
      </div>

      {/* Desktop: three columns */}
      <div className="hidden md:grid md:grid-cols-3 gap-y-2 md:divide-x md:divide-[#1b263d]">
        <div className="flex flex-col gap-3 pr-8">
          {col1.map(renderRow)}
        </div>
        <div className="flex flex-col gap-3 px-8">
          {col2.map(renderRow)}
        </div>
        <div className="flex flex-col gap-3 pl-8">
          {col3.map(renderRow)}
        </div>
      </div>
    </div>
  )
}
