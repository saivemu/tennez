'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeId =
  | 'ao-dark' | 'ao-light'
  | 'rg-dark' | 'rg-light'
  | 'wim-dark' | 'wim-light'
  | 'uso-dark' | 'uso-light'

export const themes = [
  { id: 'ao-dark', name: 'Australian Open', mode: 'Dark' },
  { id: 'ao-light', name: 'Australian Open', mode: 'Light' },
  { id: 'rg-dark', name: 'Roland Garros', mode: 'Dark' },
  { id: 'rg-light', name: 'Roland Garros', mode: 'Light' },
  { id: 'wim-dark', name: 'Wimbledon', mode: 'Dark' },
  { id: 'wim-light', name: 'Wimbledon', mode: 'Light' },
  { id: 'uso-dark', name: 'US Open', mode: 'Dark' },
  { id: 'uso-light', name: 'US Open', mode: 'Light' },
] as const

interface ThemeContextType {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  toggleDarkMode: () => void
}

import { createContext as _createContext } from 'react'

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'ao-dark',
  setTheme: () => {},
  toggleDarkMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}
