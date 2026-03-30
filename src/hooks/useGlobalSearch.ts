'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SearchResult {
  type: 'player' | 'tournament' | 'user'
  id: string
  label: string
  sublabel?: string
  imageUrl?: string
  href: string
}

interface UseGlobalSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  isLoading: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedIndex: number
  handleKeyDown: (e: React.KeyboardEvent) => void
  clear: () => void
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQueryRaw] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const pattern = `%${q}%`

    const [playersRes, tournamentsRes, usersRes] = await Promise.all([
      supabase.from('players').select('id, name, country_code, tour, photo_url').ilike('name', pattern).limit(5),
      supabase.from('tournaments').select('id, name, country_code, tour, logo_url').ilike('name', pattern).limit(5),
      supabase.from('profiles').select('id, username, display_name, avatar_url').or(`username.ilike.${pattern},display_name.ilike.${pattern}`).limit(5),
    ])

    const merged: SearchResult[] = [
      ...(playersRes.data ?? []).map(p => ({
        type: 'player' as const,
        id: p.id,
        label: p.name,
        sublabel: [p.tour, p.country_code].filter(Boolean).join(' · '),
        imageUrl: p.photo_url ?? undefined,
        href: `/player/${p.id}`,
      })),
      ...(tournamentsRes.data ?? []).map(t => ({
        type: 'tournament' as const,
        id: t.id,
        label: t.name,
        sublabel: [t.tour, t.country_code].filter(Boolean).join(' · '),
        imageUrl: t.logo_url ?? undefined,
        href: `/tournament/${t.id}`,
      })),
      ...(usersRes.data ?? []).map(u => ({
        type: 'user' as const,
        id: u.id,
        label: u.display_name ?? u.username,
        sublabel: `@${u.username}`,
        imageUrl: u.avatar_url ?? undefined,
        href: `/profile/${u.username}`,
      })),
    ]

    setResults(merged)
    setIsLoading(false)
    setSelectedIndex(-1)
  }, [supabase])

  function setQuery(q: string) {
    setQueryRaw(q)
    setIsOpen(q.length >= 2)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 300)
  }

  function clear() {
    setQueryRaw('')
    setResults([])
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  return { query, setQuery, results, isLoading, isOpen, setIsOpen, selectedIndex, handleKeyDown, clear }
}
