interface SurfaceBadgeProps {
  surface: 'Hard' | 'Clay' | 'Grass' | 'Indoor' | string
  size?: 'sm' | 'md'
}

export default function SurfaceBadge({ surface, size = 'md' }: SurfaceBadgeProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    Hard: { bg: '#1a4a8a', text: '#7ab3f0' },
    Clay: { bg: '#6b2d0f', text: '#e8855a' },
    Grass: { bg: '#1a4a1a', text: '#6abf6a' },
    Indoor: { bg: '#3a3a3a', text: '#aaaaaa' },
  }

  const style = colors[surface] || colors.Indoor
  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? 11 : 13

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.text,
      padding,
      fontSize,
      fontWeight: 600,
      borderRadius: 6,
      display: 'inline-block',
    }}>
      {surface}
    </span>
  )
}
