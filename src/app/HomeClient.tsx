'use client'

import { useState } from 'react'
import { DateNavigator } from '@/components/ui/DateNavigator'
import { FilterPills } from '@/components/ui/FilterPills'
import { StatusBar } from '@/components/ui/StatusBar'
import { MatchCard, type MatchCardData } from '@/components/match/MatchCard'
import { MatchListItem } from '@/components/match/MatchListItem'
import { useRouter } from 'next/navigation'
import { toDateParam } from '@/lib/utils/dates'

type FilterMode = 'all' | 'best' | 'entertaining' | 'discussed'

const FILTER_PILLS = [
  { value: 'all' as const, label: 'All' },
  { value: 'best' as const, label: 'Best' },
  { value: 'entertaining' as const, label: 'Electrifying' },
  { value: 'discussed' as const, label: 'Most Discussed' },
]

interface TournamentGroup {
  tournament: { id: string; name: string }
  matches: (MatchCardData & { scheduled_at: string | null })[]
}

interface HomeClientProps {
  date: Date
  featured: MatchCardData[]
  groups: TournamentGroup[]
  statusCounts: { live: number; finished: number; upcoming: number }
}

export function HomeClient({ date: initialDate, featured, groups, statusCounts }: HomeClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterMode>('all')

  function handleDateChange(d: Date) {
    router.push(`/?date=${toDateParam(d)}`)
  }

  const allMatches = groups.flatMap(g => g.matches)

  const filteredMatches = allMatches.filter(m => {
    if (filter === 'best') return (m.aggregate?.avg_overall ?? 0) >= 7
    if (filter === 'entertaining') return (m.aggregate?.avg_overall ?? 0) >= 6
    if (filter === 'discussed') return (m.aggregate?.total_ratings ?? 0) >= 3
    return true
  })

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* Date navigator */}
      <DateNavigator date={initialDate} onDateChange={handleDateChange} className="mb-6" />

      {/* Featured carousel */}
      {featured.length > 0 && (
        <section className="mb-8" aria-label="Featured matches">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Featured
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {featured.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* Status bar + filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusBar {...statusCounts} />
        <FilterPills pills={FILTER_PILLS} active={filter} onChange={setFilter} />
      </div>

      {/* Match list */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card px-6 py-12 text-center">
          <p className="text-text-secondary">No matches for this day.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-bg-card overflow-hidden">
          {filteredMatches.map(m => (
            <MatchListItem key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}
