'use client'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  className?: string
}

const LABELS: Record<number, string> = {
  1: 'Terrible', 2: 'Bad', 3: 'Poor', 4: 'Below avg',
  5: 'Average', 6: 'Good', 7: 'Great', 8: 'Excellent',
  9: 'Incredible', 10: 'All-time classic',
}

function sliderColor(value: number): string {
  if (value >= 8) return 'var(--rating-high)'
  if (value >= 5) return 'var(--rating-mid)'
  return 'var(--rating-low)'
}

export function Slider({ value, onChange, min = 1, max = 10, label, className = '' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const color = sliderColor(value)

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">{label}</span>
          <span className="text-sm font-bold tabular-nums" style={{ color }}>
            {value} — {LABELS[value] ?? ''}
          </span>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full cursor-pointer appearance-none rounded-full bg-border h-2 focus:outline-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${color} ${pct}%, var(--border) ${pct}%)`,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    </div>
  )
}
