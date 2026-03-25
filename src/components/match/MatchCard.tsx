'use client'

import Link from 'next/link'
import RatingRing from '@/components/ui/RatingRing'
import SurfaceBadge from '@/components/ui/SurfaceBadge'

interface Player {
  name: string
  country: string
  seed?: number
}

interface MatchCardProps {
  id: string
  player1: Player
  player2: Player
  score?: string
  surface: string
  tournament: string
  round: string
  status: 'live' | 'finished' | 'upcoming'
  rating?: number
  ratingCount?: number
  scheduledAt?: string
}

export default function MatchCard({
  id, player1, player2, score, surface, tournament,
  round, status, rating, ratingCount, scheduledAt
}: MatchCardProps) {
  return (
    <Link href={`/match/${id}`}>
      <div
        className="p-4 rounded-xl border transition hover:border-[var(--accent)] cursor-pointer"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {tournament} · {round}
          </span>
          <SurfaceBadge surface={surface} size="sm" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {player1.seed && (
                <span style={{ color: 'var(--text-secondary)', fontSize: 11, minWidth: 16 }}>
                  [{player1.seed}]
                </span>
              )}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>
                {player1.name}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{player1.country}</span>
            </div>
            <div className="flex items-center gap-2">
              {player2.seed && (
                <span style={{ color: 'var(--text-secondary)', fontSize: 11, minWidth: 16 }}>
                  [{player2.seed}]
                </span>
              )}
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>
                {player2.name}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{player2.country}</span>
            </div>
          </div>

          <div className="text-right min-w-[80px]">
            {status === 'finished' && score && (
              <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>{score}</span>
            )}
            {status === 'live' && (
              <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700 }}>LIVE</span>
            )}
            {status === 'upcoming' && scheduledAt && (
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{scheduledAt}</span>
            )}
          </div>

          {rating && rating > 0 ? (
            <div className="flex flex-col items-center">
              <RatingRing score={rating} size={56} strokeWidth={4} showLabel={false} />
              {ratingCount && (
                <span style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>
                  {ratingCount} ratings
                </span>
              )}
            </div>
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>Rate</span>
            </div>
          )}
        </div>

        {status === 'live' && (
          <div className="mt-3 flex items-center gap-2">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
            <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>In Progress</span>
          </div>
        )}
      </div>
    </Link>
  )
}
