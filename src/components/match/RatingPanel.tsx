import { RatingRing } from '@/components/ui/RatingRing'

interface Aggregate {
  avg_overall: number | null
  avg_entertainment: number | null
  avg_level: number | null
  avg_umpiring: number | null
  avg_crowd: number | null
  total_ratings: number
  rating_distribution: Record<string, number> | null
}

interface RatingPanelProps {
  aggregate: Aggregate | null

}

function DistributionBar({ distribution, total }: { distribution: Record<string, number> | null; total: number }) {
  if (!distribution || total === 0) return null
  const entries = Array.from({ length: 10 }, (_, i) => {
    const score = 10 - i
    return { score, count: distribution[score] ?? 0 }
  })

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(({ score, count }) => {
        const pct = total > 0 ? (count / total) * 100 : 0
        const color = score >= 8 ? 'var(--rating-high)' : score >= 5 ? 'var(--rating-mid)' : 'var(--rating-low)'
        return (
          <div key={score} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right text-text-secondary tabular-nums">{score}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="w-4 text-right text-text-secondary tabular-nums">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function SubScore({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null
  const color = value >= 8 ? 'var(--rating-high)' : value >= 5 ? 'var(--rating-mid)' : 'var(--rating-low)'
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-bg-elevated px-3 py-2.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-lg font-bold tabular-nums" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  )
}

export function RatingPanel({ aggregate }: RatingPanelProps) {
  if (!aggregate || aggregate.total_ratings === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-6 text-center">
        <p className="text-text-secondary">No ratings yet — be the first to rate this match.</p>
      </div>
    )
  }

  const agg = aggregate

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">Community Rating</h2>

      {/* Main score + distribution */}
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-1">
          <RatingRing score={agg.avg_overall} size={96} strokeWidth={6} />
          <span className="text-xs text-text-secondary">{agg.total_ratings} ratings</span>
        </div>
        <div className="flex-1">
          <DistributionBar distribution={agg.rating_distribution as Record<string, number> | null} total={agg.total_ratings} />
        </div>
      </div>

      {/* Sub-scores */}
      {(agg.avg_entertainment || agg.avg_level || agg.avg_umpiring || agg.avg_crowd) && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SubScore label="Entertainment" value={agg.avg_entertainment} />
          <SubScore label="Level of Play" value={agg.avg_level} />
          <SubScore label="Umpiring" value={agg.avg_umpiring} />
          <SubScore label="Crowd" value={agg.avg_crowd} />
        </div>
      )}
    </div>
  )
}
