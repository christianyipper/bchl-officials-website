'use client'

import { useState } from 'react'

interface GameDetails {
  id: string
  hockeytechId: number
  date: string
  location: string
  homeTeam: string
  awayTeam: string
  role: string
  duration: number | null
  homePIM: number
  awayPIM: number
}

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

interface GameHistoryTableProps {
  officialId: string
  initialGames: GameDetails[]
  initialPage: number
  totalPages: number
  totalGames: number
}

export default function GameHistoryTable({
  officialId,
  initialGames,
  initialPage,
  totalPages,
  totalGames
}: GameHistoryTableProps) {
  const [games, setGames] = useState<GameDetails[]>(initialGames)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)

  const loadPage = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/officials/${officialId}?page=${page}&limit=50`)
      const data = await res.json()
      setGames(data.games)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading page:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      loadPage(page)
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

  return (
    <div>
      <div className="bg-white shadow overflow-hidden">
        <table className="min-w-full divide-y divide-[#1b263d]">
          <thead className="bg-[#1b263d]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Teams
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Stats
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className={`bg-black divide-y divide-[#1b263d] ${loading ? 'opacity-50' : ''}`}>
            {games.map((game: GameDetails, index: number) => (
              <tr
                key={game.id}
                onClick={() => window.open(`https://lscluster.hockeytech.com/game_reports/official-game-report.php?client_code=bchl&game_id=${game.hockeytechId}&lang_id=1`, '_blank')}
                className="group hover:bg-orange-600 hover:text-white cursor-pointer transition-colors duration-300"
              >
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold group-hover:text-white ${
                  (totalGames - ((currentPage - 1) * 50) - index) % 100 === 0
                    ? 'text-bchl-light-orange'
                    : 'text-gray-600'
                }`}>
                  {totalGames - ((currentPage - 1) * 50) - index}
                </td>
                <td className="px-6 py-4">
                  <div className="text-white text-sm">
                    {new Date(game.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-gray-400 text-xs group-hover:text-white">{game.location}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white text-sm">H: {getCity(game.homeTeam)}</div>
                  <div className="text-gray-400 text-sm group-hover:text-white">A: {getCity(game.awayTeam)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white text-sm">{game.homePIM} PIM</div>
                  <div className="text-gray-400 text-sm group-hover:text-white">{game.awayPIM} PIM</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      game.role === 'referee'
                        ? 'bg-white text-black'
                        : 'bg-transparent text-white border-2 border-white'
                    }`}
                  >
                    {game.role === 'referee' ? 'Referee' : 'Linesperson'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-black px-4 py-3 flex items-center justify-between border-t border-bchl-navy sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * 50 + 1}</span> -{' '}
                <span className="font-medium">{Math.min(currentPage * 50, totalGames)}</span> of{' '}
                <span className="font-medium">{totalGames}</span> games
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 bg-black text-sm font-bold text-white hover:bg-orange-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  ←
                </button>
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    disabled={page === '...' || page === currentPage || loading}
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
                  disabled={currentPage === totalPages || loading}
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
