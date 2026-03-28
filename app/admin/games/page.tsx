'use client'

import { useState, useEffect } from 'react'

const TEAMS = [
  'Alberni Valley Bulldogs', 'Brooks Bandits', 'Chilliwack Chiefs',
  'Coquitlam Express', 'Cowichan Valley Capitals', 'Cranbrook Bucks',
  'Langley Rivermen', 'Merritt Centennials', 'Nanaimo Clippers',
  'Okotoks Oilers', 'Penticton Vees', 'Powell River Kings',
  'Prince George Spruce Kings', 'Salmon Arm Silverbacks',
  'Sherwood Park Crusaders', 'Spruce Grove Saints', 'Surrey Eagles',
  'Trail Smoke Eaters', 'Vernon Vipers', 'Victoria Grizzlies',
  'Wenatchee Wild', 'West Kelowna Warriors',
].sort()

interface GameOfficial { id: string; officialId: string; name: string; role: string }
interface Game { id: string; date: string; homeTeam: string; awayTeam: string; officials: GameOfficial[] }
interface OfficialOption { id: string; name: string }

function getDefaultDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 14)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(start), end: fmt(end) }
}

export default function AdminGames() {
  const defaults = getDefaultDates()
  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [team, setTeam] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [allOfficials, setAllOfficials] = useState<OfficialOption[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedGame, setExpandedGame] = useState<string | null>(null)
  const [addOfficialId, setAddOfficialId] = useState('')
  const [addRole, setAddRole] = useState('referee')
  const [addingTo, setAddingTo] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/officials').then(r => r.json()).then(setAllOfficials)
    search()
  }, [])

  async function search() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ startDate, endDate })
      if (team) params.set('team', team)
      const res = await fetch(`/api/admin/games?${params}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setGames(data)
    } catch (e) {
      alert('Failed to load games: ' + e)
    } finally {
      setLoading(false)
    }
  }

  async function removeOfficial(gameId: string, gameOfficialId: string) {
    await fetch(`/api/admin/game-officials/${gameOfficialId}`, { method: 'DELETE' })
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, officials: g.officials.filter(o => o.id !== gameOfficialId) } : g
    ))
  }

  async function changeRole(gameId: string, gameOfficialId: string, role: string) {
    const updated = await fetch(`/api/admin/game-officials/${gameOfficialId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    }).then(r => r.json())
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, officials: g.officials.map(o => o.id === gameOfficialId ? updated : o) } : g
    ))
  }

  async function addOfficial(gameId: string) {
    if (!addOfficialId) return
    const res = await fetch('/api/admin/game-officials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, officialId: addOfficialId, role: addRole })
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error)
      return
    }
    const newOfficial = await res.json()
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, officials: [...g.officials, newOfficial] } : g
    ))
    setAddingTo(null)
    setAddOfficialId('')
    setAddRole('referee')
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      weekday: 'short', month: 'short', day: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Game Editor</h1>
          <a href="/admin/logout" className="text-gray-400 hover:text-white text-sm">Logout</a>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end border border-gray-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-sm [color-scheme:dark]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-sm [color-scheme:dark]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Team</label>
            <select value={team} onChange={e => setTeam(e.target.value)}
              className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-sm">
              <option value="">All Teams</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={search} disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded font-bold text-sm transition-colors disabled:opacity-50">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {/* Games */}
        <div className="space-y-3">
          {games.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">No games found</p>
          )}
          {games.map(game => (
            <div key={game.id} className="bg-gray-900 rounded-lg border border-gray-800">
              {/* Game header */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{formatDate(game.date)}</p>
                    <p className="font-bold">{game.homeTeam} <span className="text-gray-400 font-normal">vs</span> {game.awayTeam}</p>
                  </div>
                  <button
                    onClick={() => { setExpandedGame(expandedGame === game.id ? null : game.id); setAddingTo(null) }}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    {expandedGame === game.id ? 'Collapse' : 'Edit'}
                  </button>
                </div>

                {/* Officials summary */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {game.officials.filter(o => o.role === 'referee').map(o => (
                    <span key={o.id} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">R: {o.name}</span>
                  ))}
                  {game.officials.filter(o => o.role === 'linesperson').map(o => (
                    <span key={o.id} className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded">L: {o.name}</span>
                  ))}
                  {game.officials.length === 0 && (
                    <span className="text-xs text-red-400">No officials assigned</span>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {expandedGame === game.id && (
                <div className="border-t border-gray-800 p-4 space-y-2">
                  {game.officials.map(o => (
                    <div key={o.id} className="flex items-center gap-3">
                      <span className="text-sm flex-1">{o.name}</span>
                      <select
                        value={o.role}
                        onChange={e => changeRole(game.id, o.id, e.target.value)}
                        className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-700"
                      >
                        <option value="referee">Referee</option>
                        <option value="linesperson">Linesperson</option>
                      </select>
                      <button
                        onClick={() => removeOfficial(game.id, o.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/30"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Add official form */}
                  {addingTo === game.id ? (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
                      <select
                        value={addOfficialId}
                        onChange={e => setAddOfficialId(e.target.value)}
                        className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700 flex-1"
                      >
                        <option value="">Select official...</option>
                        {allOfficials
                          .filter(o => !game.officials.find(go => go.officialId === o.id))
                          .map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                      <select
                        value={addRole}
                        onChange={e => setAddRole(e.target.value)}
                        className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700"
                      >
                        <option value="referee">Referee</option>
                        <option value="linesperson">Linesperson</option>
                      </select>
                      <button onClick={() => addOfficial(game.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded font-bold">
                        Add
                      </button>
                      <button onClick={() => setAddingTo(null)}
                        className="text-gray-400 hover:text-white text-sm px-2 py-1">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTo(game.id)}
                      className="text-sm text-orange-400 hover:text-orange-300 mt-2"
                    >
                      + Add Official
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
