'use client'

import { format, addDays, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DateNavigatorProps {
  date: Date
  onDateChange: (date: Date) => void
  className?: string
}

export function DateNavigator({ date, onDateChange, className = '' }: DateNavigatorProps) {
  const label = isToday(date)
    ? `Today, ${format(date, 'MMMM d')}`
    : format(date, 'EEEE, MMMM d')

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <button
        onClick={() => onDateChange(addDays(date, -1))}
        className="rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
        aria-label="Previous day"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={() => onDateChange(new Date())}
        className="text-sm font-semibold text-text-primary hover:text-accent transition-colors"
        aria-label="Go to today"
      >
        {label}
      </button>

      <button
        onClick={() => onDateChange(addDays(date, 1))}
        className="rounded-lg border border-border p-1.5 text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
        aria-label="Next day"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
