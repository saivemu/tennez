import Link from 'next/link'
import { SurfaceBadge } from '@/components/ui/SurfaceBadge'
import { RatingRing } from '@/components/ui/RatingRing'
import { formatMatchDate } from '@/lib/utils/dates'
import type { MatchCardData } from './MatchCard'

export function MatchListItem({ match }: { match: MatchCardData & { scheduled_at: string | null } }) {
  const avg = match.aggregate?.avg_overall ?? null
  const totalRatings = match.aggregate?.total_ratings ?? 0

  return (
    <Link
      href={`/match/${match.id}`}
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-bg-elevated"
    >
      {/* Players + score */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm font-semibold ${
              match.status === 'finished' ? 'text-text-primary' : 'text-text-secondary'
            }`}>
              {match.player1.seed ? <span className="text-xs text-text-secondary">[{match.player1.seed}] </span> : null}
              {match.player1.name}
              {' '}
              <span className="text-text-secondary">vs</span>
              {' '}
              {match.player2.seed ? <span className="text-xs text-text-secondary">[{match.player2.seed}] </span> : null}
              {match.player2.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-secondary">
              {match.round}
              {match.surface && <> · <SurfaceBadge surface={match.surface} /></>}
            </p>
          </div>
          <RatingRing score={avg} size={44} strokeWidth={3.5} className="flex-shrink-0" />
        </div>
      </div>

      {/* Status + time */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1 text-xs">
        <span className={`font-medium ${
          match.status === 'live' ? 'text-rating-low' :
          match.status === 'finished' ? 'text-text-secondary' : 'text-accent'
        }`}>
          {match.status === 'live' ? '● Live' : match.status === 'finished' ? 'Final' : formatMatchDate(match.scheduled_at)}
        </span>
        {totalRatings > 0 && (
          <span className="text-text-secondary">{totalRatings} ratings</span>
        )}
      </div>
    </Link>
  )
}
