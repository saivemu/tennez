import Link from 'next/link'
import { Home, Calendar, Rss, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlobalSearchBar } from './GlobalSearchBar'
import { signOut } from '@/lib/auth/actions'

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/matches', label: 'Matches', icon: Calendar },
  { href: '/feed', label: 'Feed', icon: Rss },
]

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-card/90 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 text-lg font-bold tracking-tight text-accent">
          Tennez
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Search — grows to fill space */}
        <div className="flex flex-1 justify-center">
          <GlobalSearchBar />
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {user && profile ? (
            <>
              <Link
                href="/settings"
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                aria-label="Settings"
              >
                <Settings size={16} />
              </Link>
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-bg-primary">
                    {(profile.display_name ?? profile.username).charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden lg:inline">{profile.display_name ?? profile.username}</span>
              </Link>
              <form>
                <button
                  formAction={signOut}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg-primary transition-colors hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="flex justify-around border-t border-border bg-bg-card sm:hidden">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-4 py-2 text-xs text-text-secondary hover:text-text-primary"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </header>
  )
}
