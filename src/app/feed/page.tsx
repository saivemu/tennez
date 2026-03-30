import { createClient } from '@/lib/supabase/server'
import { ReviewCard, type ReviewData } from '@/components/match/ReviewCard'
import Link from 'next/link'
import { subDays } from 'date-fns'

// Computed at request time (server component), not during a client render cycle
function sevenDaysAgo() {
  return subDays(new Date(), 7).toISOString()
}

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Popular: most-voted reviews in last 7 days
  const since = sevenDaysAgo()
  const { data: reviewRows } = await supabase
    .from('reviews')
    .select(`
      id, body, created_at,
      author:profiles!reviews_user_id_fkey(username, display_name, avatar_url),
      votes:review_votes(vote_type),
      match:matches!reviews_match_id_fkey(
        id, round, status,
        player1:players!matches_player1_id_fkey(name),
        player2:players!matches_player2_id_fkey(name),
        tournament:tournaments(name)
      )
    `)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(30)

  let userVoteMap: Record<string, 'up' | 'down'> = {}
  if (user && reviewRows?.length) {
    const { data: myVotes } = await supabase
      .from('review_votes')
      .select('review_id, vote_type')
      .eq('user_id', user.id)
      .in('review_id', reviewRows.map(r => r.id))
    userVoteMap = Object.fromEntries((myVotes ?? []).map(v => [v.review_id, v.vote_type as 'up' | 'down']))
  }

  type VoteRow = { vote_type: string }
  type AuthorRow = { username: string; display_name: string | null; avatar_url: string | null }

  const reviews: ReviewData[] = (reviewRows ?? [])
    .map(r => {
      const votes = (r.votes as unknown as VoteRow[]) ?? []
      return {
        id: r.id,
        body: r.body,
        created_at: r.created_at,
        upvotes: votes.filter(v => v.vote_type === 'up').length,
        downvotes: votes.filter(v => v.vote_type === 'down').length,
        userVote: userVoteMap[r.id] ?? null,
        author: (r.author as unknown as AuthorRow) ?? { username: 'unknown', display_name: null, avatar_url: null },
      }
    })
    .sort((a, b) => b.upvotes - a.upvotes)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Feed</h1>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-card px-6 py-12 text-center">
          <p className="text-text-secondary">No reviews this week yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-accent hover:underline">
            Browse today&apos;s matches →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} currentUserId={user?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  )
}
