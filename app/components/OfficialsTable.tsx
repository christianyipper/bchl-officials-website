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
  searchQuery?: string
}

export default function OfficialsTable({ officials, searchQuery = '' }: OfficialsTableProps) {
  const router = useRouter()
  const [sortField, setSortField] = useState<SortField>('totalGames')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

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
      .filter(official => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        const nameParts = official.name.toLowerCase().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''
        return firstName.includes(query) || lastName.includes(query)
      })
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
  }, [officials, sortField, sortDirection, searchQuery])

  // Calculate pagination
  const totalItems = sortedOfficials.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOfficials = sortedOfficials.slice(startIndex, endIndex)

  // Reset to page 1 when sort or search changes
  useMemo(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, searchQuery])

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

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
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
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
    <div className=" shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="">
          <tr>
            <th
              className={`pl-3 md:pl-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'firstName'
                  ? 'bg-orange-600 text-white'
                  : 'bg-bchl-navy text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('firstName')}
            >
              First Name
              <SortIcon field="firstName" />
            </th>
            <th
              className={`px-3 md:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'lastName'
                  ? 'bg-orange-600 text-white'
                  : 'bg-bchl-navy text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('lastName')}
            >
              Last Name
              <SortIcon field="lastName" />
            </th>
            <th
              className={`px-3 md:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'totalGames'
                  ? 'bg-orange-600 text-white'
                  : 'bg-bchl-navy text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('totalGames')}
            >
              Total Games
              <SortIcon field="totalGames" />
            </th>
            <th
              className={`px-3 md:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'refereeGames'
                  ? 'bg-orange-600 text-white'
                  : 'bg-bchl-navy text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('refereeGames')}
            >
              As Referee
              <SortIcon field="refereeGames" />
            </th>
            <th
              className={`px-3 md:px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-300 ${
                sortField === 'linespersonGames'
                  ? 'bg-orange-600 text-white'
                  : 'bg-bchl-navy text-white hover:bg-orange-600'
              }`}
              onClick={() => handleSort('linespersonGames')}
            >
              <span className="md:hidden">As Lines</span>
              <span className="hidden md:inline">As Linesperson</span>
              <SortIcon field="linespersonGames" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-bchl-navy">
          {paginatedOfficials.map((official) => {
            const nameParts = official.name.split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            return (
              <tr
                key={official.id}
                className="group hover:bg-orange-600 cursor-pointer transition-colors duration-300"
                onClick={() => router.push(`/officials/${official.id}`)}
              >
                <td className="md:w-[286px] pl-3 md:pl-6 py-3 align-top">
                  <div className={`text-[10px] md:text-lg italic font-black uppercase group-hover:text-white ${
                    sortField === 'firstName' ? 'text-bchl-light-orange' : 'text-white'
                  }`}>
                    {firstName}
                  </div>
                  <div className="flex flex-nowrap items-start gap-1 h-5">
                    {official.isActive && (
                      <span className="px-0 md:group-hover:pr-1 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-orange-600 text-transparent md:group-hover:text-white transition-all duration-300 flex items-center overflow-hidden animate-pulse md:group-hover:animate-none">
                        <span className="w-0 md:group-hover:w-1.5 h-1.5 rounded-full bg-white md:group-hover:mr-1 animate-pulse"></span>
                        Active
                      </span>
                    )}
                    {official.isOriginal57 && (
                      <span className="px-0 md:group-hover:px-2 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-transparent text-transparent md:group-hover:text-white md:group-hover:bg-transparent border-2 border-white transition-all duration-300 flex items-center overflow-hidden">
                        OG
                      </span>
                    )}
                    <span className="px-0 md:group-hover:px-1 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-white text-transparent md:group-hover:text-white md:group-hover:bg-transparent transition-all duration-300 flex items-center overflow-hidden">
                      BCHL
                    </span>
                    {official.isAhl && (
                      <span className="px-0 md:group-hover:px-1 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-white text-transparent md:group-hover:text-white md:group-hover:bg-transparent transition-all duration-300 flex items-center overflow-hidden">
                        AHL
                      </span>
                    )}
                    {official.isPwhl && (
                      <span className="px-0 md:group-hover:px-1 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-white text-transparent md:group-hover:text-white md:group-hover:bg-transparent transition-all duration-300 flex items-center overflow-hidden">
                        PWHL
                      </span>
                    )}
                    {official.isEchl && (
                      <span className="px-0 md:group-hover:px-1 h-2 w-2 md:group-hover:h-5 md:group-hover:w-auto rounded-full text-[10px] font-bold uppercase bg-white text-transparent md:group-hover:text-white md:group-hover:bg-transparent transition-all duration-300 flex items-center overflow-hidden">
                        ECHL
                      </span>
                    )}
                  </div>
                </td>
                <td className={`md:w-[286px] px-3 md:px-6 py-4 align-top whitespace-nowrap text-[10px] md:text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'lastName' ? 'text-bchl-light-orange' : 'text-white'
                }`}>
                  {lastName}
                </td>
                <td className={`px-3 md:px-6 py-4 align-top whitespace-nowrap text-[10px] md:text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'totalGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.totalGames}
                </td>
                <td className={`px-3 md:px-6 py-4 align-top whitespace-nowrap text-[10px] md:text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'refereeGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.refereeGames}
                </td>
                <td className={`px-3 md:px-6 py-4 align-top whitespace-nowrap text-[10px] md:text-lg italic font-black uppercase group-hover:text-white ${
                  sortField === 'linespersonGames' ? 'text-bchl-light-orange' : 'text-gray-400'
                }`}>
                  {official.linespersonGames}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-black px-4 py-3 flex items-center justify-between border-t border-bchl-navy sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{startIndex + 1}</span> -{' '}
                <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> officials
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 bg-black text-sm font-bold text-white hover:bg-orange-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    disabled={page === '...' || page === currentPage}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-bold transition-colors duration-300 ${
                      page === currentPage
                        ? 'z-10 bg-orange-600 text-white'
                        : page === '...'
                        ? ' bg-black text-gray-700 cursor-default'
                        : ' bg-black text-gray-400 hover:bg-orange-600 hover:text-white'
                    } disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 bg-black text-sm font-bold text-white hover:bg-orange-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
