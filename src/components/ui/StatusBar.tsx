interface StatusBarProps {
  live: number
  finished: number
  upcoming: number
}

export default function StatusBar({ live, finished, upcoming }: StatusBarProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          display: 'inline-block',
          animation: 'pulse 1.5s infinite',
        }} />
        <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
          {live} Live
        </span>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{finished}</span> Finished
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{upcoming}</span> Upcoming
      </div>
    </div>
  )
}
