export const SURFACE_COLORS: Record<string, string> = {
  'Hard':        '#60A5FA',
  'Clay':        '#FB923C',
  'Grass':       '#4ADE80',
  'Indoor Hard': '#A78BFA',
  'Carpet':      '#94A3B8',
}

export function surfaceColor(surface: string | null): string {
  return surface ? (SURFACE_COLORS[surface] ?? '#94A3B8') : '#94A3B8'
}
