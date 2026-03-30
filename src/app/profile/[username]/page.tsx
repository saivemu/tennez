import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, country_code, created_at')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [{ count: followersCount }, { count: followingCount }, { count: ratingsCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase.from('match_ratings').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Profile header */}
      <div className="mb-8 flex items-start gap-4">
        <Avatar
          src={profile.avatar_url}
          name={profile.display_name ?? profile.username}
          size={72}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{profile.display_name ?? profile.username}</h1>
          <p className="text-text-secondary">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm text-text-secondary">{profile.bio}</p>}
          <div className="mt-3 flex gap-5 text-sm">
            <span><strong className="text-text-primary">{followersCount ?? 0}</strong> <span className="text-text-secondary">followers</span></span>
            <span><strong className="text-text-primary">{followingCount ?? 0}</strong> <span className="text-text-secondary">following</span></span>
            <span><strong className="text-text-primary">{ratingsCount ?? 0}</strong> <span className="text-text-secondary">ratings</span></span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card px-6 py-8 text-center text-text-secondary">
        Full profile (reviews, player votes, tournaments, stats) coming soon.
      </div>
    </div>
  )
}
