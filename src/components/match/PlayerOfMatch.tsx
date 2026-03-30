import { Trophy, TrendingDown } from 'lucide-react'

interface PlayerAggregate {
  player_id: string
  player_name: string
  player_photo: string | null
  avg_score: number | null
  potm_votes: number
  worst_votes: number
  total_votes: number
}

interface PlayerOfMatchProps {
  aggregates: PlayerAggregate[]
}

export function PlayerOfMatch({ aggregates }: PlayerOfMatchProps) {
  if (aggregates.length === 0) return null

  const potm = [...aggregates].sort((a, b) => (b.potm_votes - a.potm_votes))[0]
  const worst = [...aggregates].sort((a, b) => (b.worst_votes - a.worst_votes))[0]

  if (!potm || potm.potm_votes === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {potm.potm_votes > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rating-high/30 bg-rating-high/5 p-4">
          <Trophy size={20} className="flex-shrink-0 text-rating-high" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-rating-high">Player of the Match</p>
            <p className="truncate font-bold text-text-primary">{potm.player_name}</p>
            <p className="text-xs text-text-secondary">{potm.potm_votes} votes</p>
          </div>
        </div>
      )}
      {worst.worst_votes > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rating-low/30 bg-rating-low/5 p-4">
          <TrendingDown size={20} className="flex-shrink-0 text-rating-low" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-rating-low">Underperformed</p>
            <p className="truncate font-bold text-text-primary">{worst.player_name}</p>
            <p className="text-xs text-text-secondary">{worst.worst_votes} votes</p>
          </div>
        </div>
      )}
    </div>
  )
}
