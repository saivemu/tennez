'use client'

import { useState, useEffect } from 'react'
import { ThemeContext, ThemeId } from './index'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('ao-dark')

  useEffect(() => {
    const stored = localStorage.getItem('tennez-theme') as ThemeId
    if (stored) {
      setThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      document.documentElement.setAttribute('data-theme', 'ao-dark')
    }
  }, [])

  function setTheme(newTheme: ThemeId) {
    setThemeState(newTheme)
    localStorage.setItem('tennez-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function toggleDarkMode() {
    const isDark = theme.endsWith('-dark')
    const base = theme.replace('-dark', '').replace('-light', '')
    setTheme(`${base}-${isDark ? 'light' : 'dark'}` as ThemeId)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
