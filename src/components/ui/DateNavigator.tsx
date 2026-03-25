'use client'

interface DateNavigatorProps {
  date: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function DateNavigator({ date, onPrev, onNext, onToday }: DateNavigatorProps) {
  const isToday = new Date().toDateString() === date.toDateString()

  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ‹
      </button>

      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15 }}>
          {formatted}
        </span>
        {!isToday && (
          <button
            onClick={onToday}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Today
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ›
      </button>
    </div>
  )
}
