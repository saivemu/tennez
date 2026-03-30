interface StatusBarProps {
  live: number
  finished: number
  upcoming: number
  className?: string
}

export function StatusBar({ live, finished, upcoming, className = '' }: StatusBarProps) {
  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      {live > 0 && (
        <span className="flex items-center gap-1.5 font-semibold text-rating-low">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rating-low opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rating-low" />
          </span>
          {live} Live
        </span>
      )}
      <span className="text-text-secondary">{finished} Finished</span>
      <span className="text-text-secondary">{upcoming} Upcoming</span>
    </div>
  )
}
