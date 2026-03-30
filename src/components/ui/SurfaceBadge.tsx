const SURFACE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Hard':        { label: 'Hard', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
  'Clay':        { label: 'Clay', color: '#FB923C', bg: 'rgba(251,146,60,0.15)' },
  'Grass':       { label: 'Grass', color: '#4ADE80', bg: 'rgba(74,222,128,0.15)' },
  'Indoor Hard': { label: 'Indoor', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  'Carpet':      { label: 'Carpet', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
}

interface SurfaceBadgeProps {
  surface: string | null
  size?: 'sm' | 'md'
  className?: string
}

export function SurfaceBadge({ surface, size = 'sm', className = '' }: SurfaceBadgeProps) {
  if (!surface) return null
  const config = SURFACE_CONFIG[surface] ?? { label: surface, color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } ${className}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}
