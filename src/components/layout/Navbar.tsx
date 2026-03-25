'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/lib/themes'

export default function Navbar() {
  const pathname = usePathname()
  const { theme, toggleDarkMode } = useTheme()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="w-full border-b" style={{
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border)'
    }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
          Tennez 🎾
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition"
            style={{ color: isActive('/') ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            Home
          </Link>
          <Link
            href="/matches"
            className="text-sm font-medium transition"
            style={{ color: isActive('/matches') ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            Matches
          </Link>
          <Link
            href="/feed"
            className="text-sm font-medium transition"
            style={{ color: isActive('/feed') ? 'var(--accent)' : 'var(--text-secondary)' }}
          >
            Feed
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-sm px-3 py-1 rounded-full border transition"
            style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            {theme.endsWith('-dark') ? '☀️' : '🌙'}
          </button>

          {/* Auth links */}
          <Link
            href="/auth/login"
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-medium px-4 py-2 rounded-lg transition"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
            }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  )
}
