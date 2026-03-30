export function ratingColor(score: number | null): string {
  if (score == null) return 'var(--text-secondary)'
  if (score >= 8) return 'var(--rating-high)'
  if (score >= 5) return 'var(--rating-mid)'
  return 'var(--rating-low)'
}

export function ratingLabel(score: number | null): string {
  if (score == null) return 'Not rated'
  if (score >= 9) return 'All-time classic'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Great'
  if (score >= 6) return 'Good'
  if (score >= 5) return 'Average'
  if (score >= 4) return 'Below avg'
  return 'Poor'
}
