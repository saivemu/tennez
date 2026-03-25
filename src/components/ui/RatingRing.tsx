'use client'

interface RatingRingProps {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export default function RatingRing({ score, size = 80, strokeWidth = 6, showLabel = true }: RatingRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const offset = circumference - progress

  const color =
    score >= 8 ? 'var(--rating-high)' :
    score >= 5 ? 'var(--rating-mid)' :
    'var(--rating-low)'

  const label =
    score >= 9 ? 'Classic' :
    score >= 8 ? 'Great' :
    score >= 7 ? 'Good' :
    score >= 5 ? 'Average' :
    'Poor'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: 'rotate(90deg)',
            transformOrigin: 'center',
            fill: 'var(--text-primary)',
            fontSize: size * 0.28,
            fontWeight: 'bold',
          }}
        >
          {score.toFixed(1)}
        </text>
      </svg>
      {showLabel && (
        <span style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</span>
      )}
    </div>
  )
}
