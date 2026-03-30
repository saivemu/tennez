import Link from 'next/link'
import { RatingRing } from '@/components/ui/RatingRing'
import { SurfaceBadge } from '@/components/ui/SurfaceBadge'
import { Star } from 'lucide-react'

export interface MatchCardData {
  id: string
  player1: { name: string; country_code?: string | null; photo_url?: string | null; seed?: number | null }
  player2: { name: string; country_code?: string | null; photo_url?: string | null; seed?: number | null }
  tournament: { id: string; name: string; logo_url?: string | null } | null
  round: string | null
  status: string
  surface: string | null
  winner_id: string | null
  sets_json: unknown
  aggregate: { avg_overall: number | null; total_ratings: number } | null
}

function SetsDisplay({ setsJson }: {
  setsJson: unknown
}) {
  if (!Array.isArray(setsJson) || setsJson.length === 0) return null

  return (
    <div className="flex items-center gap-2 text-xs tabular-nums">
      {(setsJson as Array<{ p1: number; p2: number }>).map((set, i) => (
        <span key={i} className="flex gap-0.5">
          <span className={set.p1 > set.p2 ? 'font-bold text-text-primary' : 'text-text-secondary'}>{set.p1}</span>
          <span className="text-border">-</span>
          <span className={set.p2 > set.p1 ? 'font-bold text-text-primary' : 'text-text-secondary'}>{set.p2}</span>
        </span>
      ))}
    </div>
  )
}

export function MatchCard({ match }: { match: MatchCardData }) {
  const avg = match.aggregate?.avg_overall ?? null
  const totalRatings = match.aggregate?.total_ratings ?? 0

  return (
    <Link
      href={`/match/${match.id}`}
      className="flex w-64 flex-shrink-0 flex-col gap-3 rounded-2xl border border-border bg-bg-card p-4 transition-colors hover:border-accent/50 hover:bg-bg-elevated"
    >
      {/* Tournament + surface */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-text-secondary">
          {match.tournament?.name ?? 'Unknown'} · {match.round ?? ''}
        </span>
        <SurfaceBadge surface={match.surface} />
      </div>

      {/* Players */}
      <div className="flex flex-col gap-1.5">
        {[match.player1, match.player2].map((p, i) => {
          const isWinner = match.winner_id && i === 0
            ? match.winner_id === 'player1'
            : match.winner_id === 'player2'
          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className={`truncate text-sm font-semibold ${
                match.status === 'finished' && isWinner ? 'text-text-primary' : 'text-text-secondary'
              }`}>
                {p.seed ? <span className="mr-1 text-xs text-text-secondary">[{p.seed}]</span> : null}
                {p.name}
              </span>
              {p.country_code && (
                <span className="text-xs text-text-secondary">{p.country_code}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Score / sets */}
      <SetsDisplay setsJson={match.sets_json} />

      {/* Footer: rating + engagement */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <RatingRing score={avg} size={52} strokeWidth={4} />
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            match.status === 'live'
              ? 'bg-rating-low/15 text-rating-low'
              : match.status === 'finished'
              ? 'bg-bg-elevated text-text-secondary'
              : 'bg-accent/10 text-accent'
          }`}>
            {match.status === 'live' ? '● Live' : match.status === 'finished' ? 'Final' : 'Upcoming'}
          </span>
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Star size={10} />
            <span>{totalRatings}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
