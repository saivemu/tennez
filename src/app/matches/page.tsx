'use client'

import { useState } from 'react'
import MatchCard from '@/components/match/MatchCard'
import FilterPills from '@/components/ui/FilterPills'
import StatusBar from '@/components/ui/StatusBar'
import DateNavigator from '@/components/ui/DateNavigator'

const DEMO_MATCHES = [
  {
    id: '1',
    player1: { name: 'Carlos Alcaraz', country: 'ESP', seed: 1 },
    player2: { name: 'Jannik Sinner', country: 'ITA', seed: 2 },
    score: '6-3 6-4',
    surface: 'Clay',
    tournament: 'Roland Garros',
    round: 'Final',
    status: 'finished' as const,
    rating: 9.2,
    ratingCount: 1842,
  },
  {
    id: '2',
    player1: { name: 'Novak Djokovic', country: 'SRB', seed: 3 },
    player2: { name: 'Daniil Medvedev', country: 'RUS', seed: 4 },
    score: '7-6 4-6 6-3',
    surface: 'Hard',
    tournament: 'Australian Open',
    round: 'Semifinal',
    status: 'finished' as const,
    rating: 8.5,
    ratingCount: 923,
  },
  {
    id: '3',
    player1: { name: 'Aryna Sabalenka', country: 'BLR', seed: 1 },
    player2: { name: 'Iga Swiatek', country: 'POL', seed: 2 },
    surface: 'Grass',
    tournament: 'Wimbledon',
    round: 'Quarterfinal',
    status: 'live' as const,
    ratingCount: 0,
  },
  {
    id: '4',
    player1: { name: 'Taylor Fritz', country: 'USA', seed: 5 },
    player2: { name: 'Alexander Zverev', country: 'GER', seed: 6 },
    surface: 'Hard',
    tournament: 'US Open',
    round: 'Round of 16',
    status: 'upcoming' as const,
    scheduledAt: '7:00 PM',
    ratingCount: 0,
  },
]

const FILTERS = ['All', 'Best', 'Electrifying', 'Most Discussed']

export default function MatchesPage() {
  const [filter, setFilter] = useState('All')
  const [date, setDate] = useState(new Date())

  function prevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d)
  }

  function nextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Matches
        </h1>
        <StatusBar live={1} finished={2} upcoming={1} />
      </div>

      {/* Date Navigator */}
      <div className="mb-4">
        <DateNavigator
          date={date}
          onPrev={prevDay}
          onNext={nextDay}
          onToday={() => setDate(new Date())}
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterPills options={FILTERS} selected={filter} onChange={setFilter} />
      </div>

      {/* Match List */}
      <div className="flex flex-col gap-3">
        {DEMO_MATCHES.map((match) => (
          <MatchCard key={match.id} {...match} />
        ))}
      </div>
    </div>
  )
}
