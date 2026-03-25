'use client'

interface FilterPillsProps {
  options: string[]
  selected: string
  onChange: (value: string) => void
}

export default function FilterPills({ options, selected, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const isSelected = selected === option
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
              color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
              borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
