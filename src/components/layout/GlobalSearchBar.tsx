'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Trophy, User, X } from 'lucide-react'
import { useGlobalSearch, type SearchResult } from '@/hooks/useGlobalSearch'

const TYPE_ICON = {
  player: <span className="text-xs">🎾</span>,
  tournament: <Trophy size={12} className="text-text-secondary" />,
  user: <User size={12} className="text-text-secondary" />,
}

export function GlobalSearchBar() {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, selectedIndex, handleKeyDown, clear } =
    useGlobalSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cmd+K / Ctrl+K to focus
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [setIsOpen])

  const groupedLabels: Record<SearchResult['type'], string> = {
    player: 'Players',
    tournament: 'Tournaments',
    user: 'Users',
  }

  const sections = (['player', 'tournament', 'user'] as const)
    .map(type => ({ type, items: results.filter(r => r.type === type) }))
    .filter(s => s.items.length > 0)

  let globalIndex = -1

  return (
    <div ref={containerRef} className="relative w-full max-w-xs lg:max-w-sm">
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-text-secondary pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search players, tournaments…"
          className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-8 pr-8 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
          aria-label="Global search"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-results"
          role="combobox"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-2 rounded p-0.5 text-text-secondary hover:text-text-primary"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="search-results"
          className="absolute top-full left-0 z-50 mt-1 w-full min-w-72 rounded-xl border border-border bg-bg-elevated shadow-xl"
          role="listbox"
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-text-secondary">Searching…</p>
          ) : sections.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">No results found</p>
          ) : (
            sections.map(({ type, items }) => (
              <div key={type}>
                <p className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {groupedLabels[type]}
                </p>
                {items.map(result => {
                  globalIndex++
                  const idx = globalIndex
                  return (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={clear}
                      role="option"
                      aria-selected={selectedIndex === idx}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        selectedIndex === idx
                          ? 'bg-accent/10 text-text-primary'
                          : 'text-text-primary hover:bg-bg-card'
                      }`}
                    >
                      <span className="flex-shrink-0">{TYPE_ICON[result.type]}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{result.label}</span>
                        {result.sublabel && (
                          <span className="block truncate text-xs text-text-secondary">{result.sublabel}</span>
                        )}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ))
          )}
          <div className="border-t border-border px-3 py-2">
            <p className="text-xs text-text-secondary">
              <kbd className="rounded border border-border px-1 font-mono text-xs">⌘K</kbd> to focus
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
