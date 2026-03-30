'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId =
  | 'ao-dark'
  | 'ao-light'
  | 'rg-dark'
  | 'rg-light'
  | 'wim-dark'
  | 'wim-light'
  | 'uso-dark'
  | 'uso-light'

export type Tournament = 'ao' | 'rg' | 'wim' | 'uso'
export type Mode = 'dark' | 'light'

export interface Theme {
  id: ThemeId
  tournament: Tournament
  mode: Mode
  label: string
  tournamentLabel: string
  primaryColor: string
  accentColor: string
}

export const THEMES: Theme[] = [
  {
    id: 'ao-dark',
    tournament: 'ao',
    mode: 'dark',
    label: 'Australian Open Dark',
    tournamentLabel: 'Australian Open',
    primaryColor: '#0A3B7E',
    accentColor: '#FFD700',
  },
  {
    id: 'ao-light',
    tournament: 'ao',
    mode: 'light',
    label: 'Australian Open Light',
    tournamentLabel: 'Australian Open',
    primaryColor: '#0A3B7E',
    accentColor: '#FFD700',
  },
  {
    id: 'rg-dark',
    tournament: 'rg',
    mode: 'dark',
    label: 'Roland Garros Dark',
    tournamentLabel: 'Roland Garros',
    primaryColor: '#C84B31',
    accentColor: '#2D5016',
  },
  {
    id: 'rg-light',
    tournament: 'rg',
    mode: 'light',
    label: 'Roland Garros Light',
    tournamentLabel: 'Roland Garros',
    primaryColor: '#C84B31',
    accentColor: '#2D5016',
  },
  {
    id: 'wim-dark',
    tournament: 'wim',
    mode: 'dark',
    label: 'Wimbledon Dark',
    tournamentLabel: 'Wimbledon',
    primaryColor: '#00573F',
    accentColor: '#44006B',
  },
  {
    id: 'wim-light',
    tournament: 'wim',
    mode: 'light',
    label: 'Wimbledon Light',
    tournamentLabel: 'Wimbledon',
    primaryColor: '#00573F',
    accentColor: '#44006B',
  },
  {
    id: 'uso-dark',
    tournament: 'uso',
    mode: 'dark',
    label: 'US Open Dark',
    tournamentLabel: 'US Open',
    primaryColor: '#1A1A2E',
    accentColor: '#FF6B35',
  },
  {
    id: 'uso-light',
    tournament: 'uso',
    mode: 'light',
    label: 'US Open Light',
    tournamentLabel: 'US Open',
    primaryColor: '#1A1A2E',
    accentColor: '#FF6B35',
  },
]

const DEFAULT_THEME: ThemeId = 'ao-dark'
const STORAGE_KEY = 'tennez-theme'

interface ThemeContextValue {
  themeId: ThemeId
  theme: Theme
  setTheme: (id: ThemeId) => void
  setTournament: (tournament: Tournament) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialTheme(fallback: ThemeId): ThemeId {
  if (typeof window === 'undefined') return fallback
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null
  if (stored && THEMES.some(t => t.id === stored)) return stored
  return fallback
}

export function ThemeProvider({ children, initialTheme }: {
  children: React.ReactNode
  initialTheme?: ThemeId
}) {
  const [themeId, setThemeId] = useState<ThemeId>(() => getInitialTheme(initialTheme ?? DEFAULT_THEME))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  const theme = THEMES.find(t => t.id === themeId)!

  function setTheme(id: ThemeId) {
    setThemeId(id)
  }

  function setTournament(tournament: Tournament) {
    const current = THEMES.find(t => t.id === themeId)!
    const next = THEMES.find(t => t.tournament === tournament && t.mode === current.mode)!
    setThemeId(next.id)
  }

  function toggleMode() {
    const current = THEMES.find(t => t.id === themeId)!
    const next = THEMES.find(
      t => t.tournament === current.tournament && t.mode !== current.mode
    )!
    setThemeId(next.id)
  }

  return (
    <ThemeContext value={{ themeId, theme, setTheme, setTournament, toggleMode }}>
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
