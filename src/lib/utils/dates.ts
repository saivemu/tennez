import { format, isToday, isYesterday, isTomorrow } from 'date-fns'

export function formatMatchDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD'
  const d = new Date(dateStr)
  if (isToday(d)) return `Today ${format(d, 'HH:mm')}`
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`
  if (isTomorrow(d)) return `Tomorrow ${format(d, 'HH:mm')}`
  return format(d, 'MMM d, HH:mm')
}

export function toDateParam(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateParam(param: string): Date {
  return new Date(`${param}T00:00:00`)
}
