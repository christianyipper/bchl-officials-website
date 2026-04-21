'use client'

import { useState, useEffect } from 'react'

interface Official { id: string; name: string; gameCount: number }

export default function AdminOfficials() {
  const [duplicates, setDuplicates] = useState<Official[][]>([])
  const [all, setAll] = useState<Official[]>([])
  const [search, setSearch] = useState('')
  const [targetId, setTargetId] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/merge-officials').then(r => r.json())
    setDuplicates(data.duplicates)
    setAll(data.all)
    setLoading(false)
  }

  async function merge() {
    if (!targetId || !sourceId) return alert('Select both officials')
    if (targetId === sourceId) return alert('Cannot merge an official with themselves')
    const target = all.find(o => o.id === targetId)
    const source = all.find(o => o.id === sourceId)
    if (!confirm(`Merge "${source?.name}" (${source?.gameCount} games) INTO "${target?.name}" (${target?.gameCount} games)?\n\nThis will delete "${source?.name}" and cannot be undone.`)) return

    setMerging(true)
    setMessage('')
    const res = await fetch('/api/admin/merge-officials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId, sourceId })
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error)
    } else {
      setMessage(`Done — "${data.merged.name}" now has ${data.merged.gameCount} total games`)
      setTargetId('')
      setSourceId('')
      await load()
    }
    setMerging(false)
  }

  function prefill(group: Official[]) {
    // Pick the one with more games as target
    const sorted = [...group].sort((a, b) => b.gameCount - a.gameCount)
    setTargetId(sorted[0].id)
    setSourceId(sorted[1].id)
    setMessage('')
  }

  const filtered = search
    ? all.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : all

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Merge Officials</h1>
          <a href="/admin/games" className="text-gray-400 hover:text-white text-sm">← Game Editor</a>
        </div>

        {/* Auto-detected duplicates */}
        {duplicates.length > 0 && (
          <div className="bg-gray-900 rounded-lg border border-yellow-800 p-4 mb-6">
            <h2 className="text-yellow-400 font-bold text-sm uppercase tracking-wide mb-3">
              Auto-detected duplicates ({duplicates.length})
            </h2>
            <div className="space-y-2">
              {duplicates.map((group, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                  <div className="flex gap-4 flex-wrap">
                    {group.map(o => (
                      <span key={o.id} className="text-sm">
                        <span className="text-white">"{o.name}"</span>
                        <span className="text-gray-400 ml-1">({o.gameCount} games)</span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => prefill(group)}
                    className="text-xs text-orange-400 hover:text-orange-300 ml-4 whitespace-nowrap"
                  >
                    Pre-fill →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual merge */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">Manual Merge</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Keep this official (target)</label>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700"
              >
                <option value="">Select...</option>
                {filtered.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.gameCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Delete this official (source)</label>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700"
              >
                <option value="">Select...</option>
                {filtered.filter(o => o.id !== targetId).map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.gameCount})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search officials..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 flex-1"
            />
            <button
              onClick={merge}
              disabled={!targetId || !sourceId || merging}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm px-5 py-2 rounded font-bold transition-colors"
            >
              {merging ? 'Merging...' : 'Merge'}
            </button>
          </div>

          {message && <p className="text-green-400 text-sm mt-3">{message}</p>}
        </div>

        {/* All officials list */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-3">
            All Officials ({loading ? '...' : filtered.length})
          </h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filtered.map(o => (
              <div key={o.id} className="flex justify-between text-sm px-2 py-1 rounded hover:bg-gray-800">
                <span className={o.name === '-' ? 'text-yellow-400' : 'text-white'}>{o.name}</span>
                <span className="text-gray-400">{o.gameCount} games</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
