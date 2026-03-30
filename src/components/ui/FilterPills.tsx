'use client'

interface FilterPill<T extends string> {
  value: T
  label: string
}

interface FilterPillsProps<T extends string> {
  pills: FilterPill<T>[]
  active: T
  onChange: (value: T) => void
  className?: string
}

export function FilterPills<T extends string>({ pills, active, onChange, className = '' }: FilterPillsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none ${className}`}
    >
      {pills.map(pill => (
        <button
          key={pill.value}
          role="tab"
          aria-selected={active === pill.value}
          onClick={() => onChange(pill.value)}
          className={`flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            active === pill.value
              ? 'bg-accent text-bg-primary'
              : 'border border-border text-text-secondary hover:border-accent hover:text-text-primary'
          }`}
        >
          {pill.label}
        </button>
      ))}
    </div>
  )
}
