import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth/actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/settings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, bio, theme_preference')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Settings</h1>

      <div className="flex flex-col gap-4">
        {/* Account info */}
        <section className="rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Account</h2>
          <p className="text-sm text-text-primary">{user.email}</p>
          {profile && (
            <p className="text-sm text-text-secondary">@{profile.username}</p>
          )}
        </section>

        {/* Theme — placeholder, full picker in next phase */}
        <section className="rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-secondary">Theme</h2>
          <p className="text-sm text-text-secondary">Grand Slam theme picker coming soon.</p>
        </section>

        {/* Sign out */}
        <section className="rounded-xl border border-border bg-bg-card p-5">
          <form>
            <button
              formAction={signOut}
              className="w-full rounded-lg bg-rating-low/10 px-4 py-2.5 text-sm font-semibold text-rating-low hover:bg-rating-low/20"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
