'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

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

type SortField = 'firstName' | 'lastName' | 'totalGames' | 'refereeGames' | 'linespersonGames'
type SortDirection = 'asc' | 'desc'

interface OfficialsTableProps {
  officials: OfficialSummary[]
}

export default function OfficialsTable({ officials }: OfficialsTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>('totalGames')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field
      setSortField(field)
      // Numeric fields default to descending (highest first), text fields to ascending
      const isNumericField = field === 'totalGames' || field === 'refereeGames' || field === 'linespersonGames'
      setSortDirection(isNumericField ? 'desc' : 'asc')
    }
  }

  const sortedOfficials = useMemo(() => {
    return [...officials]
      .filter(official => official.name !== '-' && official.name.trim() !== '' && official.totalGames > 0)
      .sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        if (sortField === 'firstName') {
          aValue = a.name.split(' ')[0]?.toLowerCase() || ''
          bValue = b.name.split(' ')[0]?.toLowerCase() || ''
        } else if (sortField === 'lastName') {
          const aParts = a.name.split(' ')
          const bParts = b.name.split(' ')
          aValue = aParts[aParts.length - 1]?.toLowerCase() || ''
          bValue = bParts[bParts.length - 1]?.toLowerCase() || ''
        } else {
          aValue = a[sortField]
          bValue = b[sortField]
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
  }, [officials, sortField, sortDirection])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-400">↕</span>
    }
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  if (officials.length === 0) {
    return (
      <div className="bg-bchl-navy rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-black">
          <thead className="bg-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-64">
                First Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Total Games
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                As Referee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                As Linesperson
              </th>
            </tr>
          </thead>
          <tbody className="bg-bchl-navy divide-y divide-black">
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-white">
                No officials found. Start by scraping game data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="bg-bchl-navy shadow overflow-hidden">
      <table className="min-w-full divide-y divide-bchl-navy">
        <thead className="bg-bchl-navy">
          <tr>
            <th
              className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 w-64 ${
                sortField === 'firstName'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('firstName')}
            >
              First Name
              <SortIcon field="firstName" />
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'lastName'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('lastName')}
            >
              Last Name
              <SortIcon field="lastName" />
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'totalGames'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('totalGames')}
            >
              Total Games
              <SortIcon field="totalGames" />
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'refereeGames'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('refereeGames')}
            >
              As Referee
              <SortIcon field="refereeGames" />
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'linespersonGames'
                  ? 'bg-white text-black'
                  : 'text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('linespersonGames')}
            >
              As Linesperson
              <SortIcon field="linespersonGames" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-bchl-navy divide-y divide-bchl-navy">
          {sortedOfficials.map((official) => {
            const nameParts = official.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            return (
              <tr
                key={official.id}
                className="bg-black group hover:bg-orange-600 cursor-pointer transition-colors duration-300"
                onClick={() => router.push(`/officials/${official.id}`)}
              >
                <td className="pl-6 py-4 w-80 align-top">
                  <div className={`text-lg italic font-black uppercase group-hover:text-white ${
                    sortField === 'firstName' ? 'text-bchl-light-orange' : 'text-white'
                  }`}>
                    {firstName}
                  </div>
                  <div className="flex flex-nowrap items-start gap-1 mt-2 h-6">
                    {official.isActive && (
                      <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-orange-600 text-transparent group-hover:text-white transition-all duration-300 flex items-center overflow-hidden">
                        <span className="w-0 group-hover:w-1 h-1 rounded-full bg-white group-hover:mr-1 animate-pulse"></span>
                        Active
                      </span>
                    )}
                    {official.isOriginal57 && (
                      <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-[#ffcf0e] text-transparent group-hover:text-[#ffcf0e] group-hover:bg-[#a66600] border border-[#ffcf0e] transition-all duration-300 flex items-center overflow-hidden">
                        OG:57
                      </span>
                    )}
                    <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-[#0067de] text-transparent group-hover:text-white transition-all duration-300 flex items-center overflow-hidden">
                      BCHL
                    </span>
                    {official.isAhl && (
                      <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-[#c70000] text-transparent group-hover:text-white transition-all duration-300 flex items-center overflow-hidden">
                        AHL
                      </span>
                    )}
                    {official.isEchl && (
                      <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-[#c70000] text-transparent group-hover:text-white transition-all duration-300 flex items-center overflow-hidden">
                        ECHL
                      </span>
                    )}
                    {official.isPwhl && (
                      <span className="px-0 group-hover:px-2 h-2 w-2 group-hover:h-6 group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-[#550de7] text-transparent group-hover:text-white transition-all duration-300 flex items-center overflow-hidden">
                        PWHL
                      </span>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-4 align-top whitespace-nowrap text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'lastName' ? 'text-bchl-light-orange' : 'text-white'
                }`}>
                  {lastName}
                </td>
                <td className={`px-6 py-4 align-top whitespace-nowrap text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'totalGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.totalGames}
                </td>
                <td className={`px-6 py-4 align-top whitespace-nowrap text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'refereeGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.refereeGames}
                </td>
                <td className={`px-6 py-4 align-top whitespace-nowrap text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'linespersonGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.linespersonGames}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
