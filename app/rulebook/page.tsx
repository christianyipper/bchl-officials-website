'use client'

import { useState, useMemo } from 'react'
import { sections } from '@/lib/rulebook'

function RichContent({ text, className }: { text: string; className?: string }) {
  const renderBold = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, k) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={k} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        : part
    )
  }

  const paragraphs = text.split(/\n\n+/)
  return (
    <div className={`font-[family-name:var(--font-onest)] ${className ?? ''}`}>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n').filter(l => l.trim() !== '')
        const hasBullets = lines.some(l => l.startsWith('• '))
        const allBullets = lines.every(l => l.startsWith('• '))

        if (allBullets) {
          return (
            <ul key={i} className="list-none space-y-1 mb-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-orange-500 shrink-0">•</span>
                  <span>{renderBold(l.slice(2))}</span>
                </li>
              ))}
            </ul>
          )
        }

        if (hasBullets) {
          return (
            <div key={i} className="mb-2">
              {lines.map((l, j) =>
                l.startsWith('• ') ? (
                  <div key={j} className="flex gap-2 mt-1">
                    <span className="text-orange-500 shrink-0">•</span>
                    <span>{renderBold(l.slice(2))}</span>
                  </div>
                ) : (
                  <p key={j}>{renderBold(l)}</p>
                )
              )}
            </div>
          )
        }

        return <p key={i} className="mb-2 last:mb-0">{renderBold(para)}</p>
      })}
    </div>
  )
}

export default function RulebookPage() {
  const [openRule, setOpenRule] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [openSection, setOpenSection] = useState<number | null>(null)

  const toggleRule = (key: string) => {
    setOpenRule(prev => (prev === key ? null : key))
  }

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sections
    return sections
      .map(section => ({
        ...section,
        rules: section.rules.filter(rule =>
          rule.title.toLowerCase().includes(q) ||
          String(rule.number).includes(q) ||
          rule.subsections.some(
            sub => sub.content.toLowerCase().includes(q) || sub.title.toLowerCase().includes(q)
          )
        )
      }))
      .filter(section => section.rules.length > 0)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-1">Official Rulebook</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">2025–26 Season · BCHL</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:border-orange-600 transition-colors"
          />
        </div>

        {filteredSections.length === 0 && (
          <p className="text-gray-500 text-sm">No rules match your search.</p>
        )}

        <div className="divide-y divide-[#1b263d]">
        {filteredSections.map(section => (
          <div key={section.number} className="mb-0">
            {/* Section header */}
            <button
              onClick={() => setOpenSection(prev => prev === section.number ? null : section.number)}
              className={`w-full flex items-center justify-between px-4 py-4 transition-colors duration-300 ${
                openSection === section.number
                  ? 'bg-orange-600 text-white'
                  : 'bg-none text-white hover:bg-orange-600'
              }`}
            >
              <h2 className="text-lg font-black uppercase tracking-wide">
                Section {section.number} — {section.title}
              </h2>
              <span className="text-xl font-bold">
                {openSection === section.number ? '−' : '+'}
              </span>
            </button>

            {(openSection === section.number || searchQuery.trim() !== '') && (
              <div className="space-y-1">
                {section.rules.map(rule => {
                  const key = String(rule.number)
                  const isOpen = openRule === key
                  return (
                    <div key={rule.number}>
                      <button
                        onClick={() => toggleRule(key)}
                        className="w-full flex justify-between items-center bg-zinc-900 px-4 py-3 text-left hover:bg-zinc-800 transition-colors duration-150"
                      >
                        <span className="font-black uppercase text-sm flex items-center gap-3">
                          <span className="text-orange-600 text-xs font-mono w-8 shrink-0">
                            {rule.number}
                          </span>
                          {rule.title}
                          {rule.updated && (
                            <span className="ml-2 text-orange-400 text-xs normal-case font-normal bg-orange-900/40 px-2 py-0.5">
                              Updated {rule.updated}
                            </span>
                          )}
                        </span>
                        <span className="text-orange-600 text-lg font-bold ml-4 shrink-0">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="bg-zinc-950 border-l-2 border-orange-600 px-5 py-5 space-y-5">
                          {rule.subsections.map(sub => (
                            <div key={sub.id}>
                              <div className="flex gap-3 items-baseline mb-1">
                                <span className="text-orange-500 text-xs font-mono font-bold shrink-0">
                                  {sub.id}
                                </span>
                                {sub.title && (
                                  <h4 className="font-bold text-xs uppercase text-gray-300 tracking-wide">
                                    {sub.title}
                                  </h4>
                                )}
                              </div>
                              <RichContent
                                text={sub.content}
                                className="text-gray-400 text-sm leading-relaxed pl-7"
                              />
                              {sub.penalty && (
                                <RichContent
                                  text={sub.penalty}
                                  className="text-orange-400 text-xs font-bold mt-2 pl-7 border-l border-orange-700 ml-7"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}
