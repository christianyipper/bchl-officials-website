'use client'

import { useState } from 'react'
import AnimatedCounter from './AnimatedCounter'

interface OfficialPenaltiesProps {
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

export default function OfficialPenalties({ totalPIM, minors, majors, matches, misconducts, gameMisconducts, fights, instigators, aggressors, faceoffViolations, minorsRank, majorsRank, matchesRank, misconductsRank, gameMisconductsRank, fightsRank, instigatorsRank, aggressorsRank, faceoffViolationsRank, topPenalties }: OfficialPenaltiesProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(false)

  if (totalPIM <= 0 || topPenalties.length === 0) return null

  const maxCount = topPenalties[0].count

  const desktopPenalties = desktopExpanded ? topPenalties : topPenalties.slice(0, 12)
  const desktopThird = Math.ceil(desktopPenalties.length / 3)
  const col1 = desktopPenalties.slice(0, desktopThird)
  const col2 = desktopPenalties.slice(desktopThird, desktopThird * 2)
  const col3 = desktopPenalties.slice(desktopThird * 2)

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

  const mobilePenalties = mobileExpanded ? topPenalties : topPenalties.slice(0, 5)

  const row1 = [
    { label: 'Minor', value: minors, rank: minorsRank },
    { label: 'Major', value: majors, rank: majorsRank },
    { label: 'Match', value: matches, rank: matchesRank },
  ]

  const row2 = [
    { label: 'Misc.', value: misconducts, rank: misconductsRank },
    { label: 'Game Misc.', value: gameMisconducts, rank: gameMisconductsRank },
  ]

  const row3 = [
    { label: 'Fighting', value: fights, rank: fightsRank },
    { label: 'Instigator', value: instigators, rank: instigatorsRank },
    { label: 'Aggressor', value: aggressors, rank: aggressorsRank },
    { label: 'FO Violation', value: faceoffViolations, rank: faceoffViolationsRank },
  ]

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white uppercase mb-4 italic">Infraction Report</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* PIM card on the left */}
        <div className="bg-bchl-navy rounded-lg px-4 py-2 flex flex-col md:w-48 shrink-0 border-4 border-bchl-navy">
          <div className="text-lg uppercase font-black italic text-white">Total PIM</div>
          <AnimatedCounter
            value={totalPIM}
            delay={1200}
            duration={2500}
            className="text-4xl font-black italic text-white mt-auto"
          />
        </div>

        {/* Two rows beside PIM */}
        <div className="flex flex-col gap-4 w-full">
          <div className="grid grid-cols-3 gap-4">
            {row1.map(stat => (
              <div key={stat.label} className="bg-white rounded-lg px-4 py-2 flex flex-col w-full border-4 border-white">
                <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                  <div className="text-lg uppercase font-black italic text-black">{stat.label}</div>
                  {stat.rank && (
                    <div className="hidden md:flex text-xs uppercase font-bold italic text-white bg-black justify-center items-center px-3 h-6 rounded-full">
                      {getOrdinal(stat.rank)}
                    </div>
                  )}
                </div>
                <AnimatedCounter
                  value={stat.value}
                  delay={1200}
                  duration={2500}
                  className="text-4xl font-black italic text-black mt-auto"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {row2.map(stat => (
              <div key={stat.label} className="bg-black rounded-lg px-4 py-2 flex flex-col w-full border-4 border-white">
                <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                  <div className="text-lg uppercase font-black italic text-white">{stat.label}</div>
                  {stat.rank && (
                    <div className="hidden md:flex text-xs uppercase font-bold italic text-black bg-white justify-center items-center px-3 h-6 rounded-full">
                      {getOrdinal(stat.rank)}
                    </div>
                  )}
                </div>
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 mb-8">
        {row3.map(stat => (
          <div key={stat.label} className="bg-orange-600 rounded-lg px-4 py-2 flex flex-col w-full border-4 border-orange-600">
            <div className="flex flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <div className="text-lg uppercase font-black italic text-white">{stat.label}</div>
              {stat.rank && (
                <div className="hidden md:flex text-xs uppercase font-bold italic text-orange-600 bg-white justify-center items-center px-3 h-6 rounded-full">
                  {getOrdinal(stat.rank)}
                </div>
              )}
            </div>
            <AnimatedCounter
              value={stat.value}
              delay={1200}
              duration={2500}
              className="text-4xl font-black italic text-white mt-auto"
            />
          </div>
        ))}
      </div>

      {/* Mobile: single column with expand */}
      <div className="md:hidden flex flex-col gap-3">
        {mobilePenalties.map(renderRow)}
        {topPenalties.length > 5 && (
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-2 text-left"
          >
            {mobileExpanded ? 'Show less' : `Show all ${topPenalties.length} penalties`}
          </button>
        )}
      </div>
      {/* Desktop: three columns */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-y-2 divide-x divide-[#1b263d]">
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
        {topPenalties.length > 12 && (
          <button
            onClick={() => setDesktopExpanded(!desktopExpanded)}
            className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-300 mt-4 text-left"
          >
            {desktopExpanded ? 'Show less' : `Show all ${topPenalties.length} penalties`}
          </button>
        )}
      </div>
    </div>
  )
}
