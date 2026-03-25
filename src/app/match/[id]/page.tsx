'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import RatingRing from '@/components/ui/RatingRing'
import SurfaceBadge from '@/components/ui/SurfaceBadge'

const DEMO_MATCH = {
  id: '1',
  player1: { name: 'Carlos Alcaraz', country: 'ESP', seed: 1 },
  player2: { name: 'Jannik Sinner', country: 'ITA', seed: 2 },
  score: '6-3 6-4',
  sets: [
    { set: 1, p1: 6, p2: 3 },
    { set: 2, p1: 6, p2: 4 },
  ],
  surface: 'Clay',
  tournament: 'Roland Garros',
  round: 'Final',
  status: 'finished',
  rating: {
    overall: 9.2,
    entertainment: 9.5,
    levelOfPlay: 9.0,
    umpiring: 7.8,
    crowd: 9.4,
    totalRatings: 1842,
  },
}

const INDICATOR_LABELS: Record<string, string> = {
  entertainment: 'Entertainment',
  levelOfPlay: 'Level of Play',
  umpiring: 'Umpiring',
  crowd: 'Crowd',
}

export default function MatchDetailPage() {
  const { id } = useParams()
  const match = DEMO_MATCH
  const [activeTab, setActiveTab] = useState<'ratings' | 'reviews' | 'discussion'>('ratings')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="p-6 rounded-xl border mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{match.tournament} · {match.round}</span>
          <SurfaceBadge surface={match.surface} size="sm" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>[{match.player1.seed}]</span>
              <span style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>{match.player1.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{match.player1.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>[{match.player2.seed}]</span>
              <span style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700 }}>{match.player2.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{match.player2.country}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-3 justify-end mb-3">
              {match.sets.map((s) => (
                <span key={s.set} style={{ color: 'var(--text-primary)', fontSize: 20, fontWeight: 700 }}>{s.p1}</span>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              {match.sets.map((s) => (
                <span key={s.set} style={{ color: 'var(--text-secondary)', fontSize: 20, fontWeight: 700 }}>{s.p2}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border mb-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-6 mb-6">
          <RatingRing score={match.rating.overall} size={96} strokeWidth={7} />
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>Community Rating</p>
            <p style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700 }}>
              {match.rating.overall}<span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 400 }}>/10</span>
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{match.rating.totalRatings.toLocaleString()} ratings</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(INDICATOR_LABELS).map(([key, label]) => {
            const score = match.rating[key as keyof typeof match.rating] as number
            const color = score >= 8 ? 'var(--rating-high)' : score >= 5 ? 'var(--rating-mid)' : 'var(--rating-low)'
            return (
              <div key={key} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{label}</span>
                  <span style={{ color, fontSize: 16, fontWeight: 700 }}>{score}</span>
                </div>
                <div style={{ marginTop: 6, height: 4, backgroundColor: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: color, width: `${(score / 10) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {(['ratings', 'reviews', 'discussion'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none',
            backgroundColor: 'transparent', cursor: 'pointer', textTransform: 'capitalize',
            color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {activeTab === 'ratings' && (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Share your rating for this match</p>
            <button style={{
              padding: '12px 32px', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)',
              borderRadius: 8, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
            }}>
              Rate This Match
            </button>
          </div>
        )}
        {activeTab === 'reviews' && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No reviews yet. Be the first to write one.</p>
        )}
        {activeTab === 'discussion' && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Discussion coming soon.</p>
        )}
      </div>
    </div>
  )
}
