interface RatingRingProps {
  score: number | null
  size?: number
  strokeWidth?: number
  className?: string
}

function ratingColor(score: number): string {
  if (score >= 8) return 'var(--rating-high)'
  if (score >= 5) return 'var(--rating-mid)'
  return 'var(--rating-low)'
}

export function ratingLabel(score: number): string {
  if (score >= 9) return 'Classic'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Great'
  if (score >= 6) return 'Good'
  if (score >= 5) return 'Average'
  if (score >= 4) return 'Below avg'
  return 'Poor'
}

export function RatingRing({ score, size = 72, strokeWidth = 5, className = '' }: RatingRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const fill = score != null ? Math.min(Math.max(score / 10, 0), 1) : 0
  const dashOffset = circumference * (1 - fill)
  const color = score != null ? ratingColor(score) : 'var(--border)'

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={score != null ? `Rating: ${score.toFixed(1)} out of 10` : 'No rating yet'}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        {score != null ? (
          <>
            <span className="text-lg font-bold tabular-nums" style={{ color }}>
              {score.toFixed(1)}
            </span>
            <span className="text-[9px] font-medium text-text-secondary mt-0.5">
              {ratingLabel(score)}
            </span>
          </>
        ) : (
          <span className="text-xs text-text-secondary">N/A</span>
        )}
      </div>
    </div>
  )
}
