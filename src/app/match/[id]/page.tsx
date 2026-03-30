import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MatchScoreCard } from '@/components/match/MatchScoreCard'
import { RatingPanel } from '@/components/match/RatingPanel'
import { PlayerOfMatch } from '@/components/match/PlayerOfMatch'
import { ReviewCard, type ReviewData } from '@/components/match/ReviewCard'
import { MatchDiscussion } from '@/components/match/MatchDiscussion'
import { RateButton } from './RateButton'
import type { Comment } from '@/hooks/useRealtimeComments'

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch match
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, round, status, surface, sets_json, winner_id, scheduled_at,
      player1_seed, player2_seed, court_name,
      player1:players!matches_player1_id_fkey(id, name, country_code, photo_url),
      player2:players!matches_player2_id_fkey(id, name, country_code, photo_url),
      tournament:tournaments(id, name),
      aggregate:match_rating_aggregates(
        avg_overall, avg_entertainment, avg_level, avg_umpiring, avg_crowd,
        total_ratings, rating_distribution, fan_perspective
      )
    `)
    .eq('id', id)
    .single()

  if (!match) notFound()

  type PlayerRow = { id: string; name: string; country_code: string | null; photo_url: string | null } | null
  const p1 = match.player1 as unknown as PlayerRow
  const p2 = match.player2 as unknown as PlayerRow

  const player1 = { id: p1?.id ?? '', name: p1?.name ?? 'TBD', country_code: p1?.country_code ?? null, photo_url: p1?.photo_url ?? null, seed: match.player1_seed }
  const player2 = { id: p2?.id ?? '', name: p2?.name ?? 'TBD', country_code: p2?.country_code ?? null, photo_url: p2?.photo_url ?? null, seed: match.player2_seed }
  const tournament = match.tournament as unknown as { id: string; name: string } | null
  const aggregate = match.aggregate as unknown as {
    avg_overall: number | null; avg_entertainment: number | null; avg_level: number | null;
    avg_umpiring: number | null; avg_crowd: number | null; total_ratings: number;
    rating_distribution: Record<string, number> | null; fan_perspective: unknown;
  } | null

  // Fetch player aggregates
  const { data: playerAggRows } = await supabase
    .from('player_match_aggregates')
    .select('player_id, avg_score, total_votes, potm_votes, worst_votes')
    .eq('match_id', id)

  const playerAggregates = (playerAggRows ?? []).map(row => {
    const p = row.player_id === player1.id ? player1 : player2
    return {
      player_id: row.player_id,
      player_name: p.name,
      player_photo: p.photo_url,
      avg_score: row.avg_score,
      total_votes: row.total_votes,
      potm_votes: row.potm_votes,
      worst_votes: row.worst_votes,
    }
  })

  // Fetch user's existing rating
  let existingRating = null
  if (user) {
    const { data } = await supabase
      .from('match_ratings')
      .select('overall_score, entertainment, level_of_play, umpiring, crowd')
      .eq('user_id', user.id)
      .eq('match_id', id)
      .single()
    existingRating = data
  }

  // Fetch comments
  const { data: commentRows } = await supabase
    .from('match_comments')
    .select(`
      id, body, score_context, created_at,
      user:profiles!match_comments_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('match_id', id)
    .order('created_at', { ascending: true })
    .limit(100)

  const comments: Comment[] = (commentRows ?? []).map(c => ({
    id: c.id,
    body: c.body,
    score_context: c.score_context,
    created_at: c.created_at,
    user: (c.user as unknown as { username: string; display_name: string | null; avatar_url: string | null }) ?? {
      username: 'unknown', display_name: null, avatar_url: null,
    },
  }))

  // Fetch reviews with vote counts
  const { data: reviewRows } = await supabase
    .from('reviews')
    .select(`
      id, body, created_at,
      author:profiles!reviews_user_id_fkey(username, display_name, avatar_url),
      votes:review_votes(vote_type)
    `)
    .eq('match_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch user's review votes
  let userVoteMap: Record<string, 'up' | 'down'> = {}
  if (user && reviewRows?.length) {
    const reviewIds = reviewRows.map(r => r.id)
    const { data: myVotes } = await supabase
      .from('review_votes')
      .select('review_id, vote_type')
      .eq('user_id', user.id)
      .in('review_id', reviewIds)
    userVoteMap = Object.fromEntries((myVotes ?? []).map(v => [v.review_id, v.vote_type as 'up' | 'down']))
  }

  const reviews: ReviewData[] = (reviewRows ?? []).map(r => {
    const votes = (r.votes as unknown as Array<{ vote_type: string }>) ?? []
    return {
      id: r.id,
      body: r.body,
      created_at: r.created_at,
      upvotes: votes.filter(v => v.vote_type === 'up').length,
      downvotes: votes.filter(v => v.vote_type === 'down').length,
      userVote: userVoteMap[r.id] ?? null,
      author: (r.author as unknown as { username: string; display_name: string | null; avatar_url: string | null }) ?? {
        username: 'unknown', display_name: null, avatar_url: null,
      },
    }
  })

  // Current user profile for discussion
  let currentUserProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    if (data) currentUserProfile = { id: user.id, ...data }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      {/* Score card */}
      <div className="mb-6">
        <MatchScoreCard
          player1={player1}
          player2={player2}
          winnerId={match.winner_id}
          setsJson={match.sets_json}
          status={match.status}
          surface={match.surface}
          round={match.round}
          tournamentName={tournament?.name ?? null}
          courtName={match.court_name}
        />
      </div>

      {/* Rate button */}
      {match.status === 'finished' && (
        <div className="mb-6 flex justify-center">
          <RateButton
            matchId={id}
            player1={{ id: player1.id, name: player1.name }}
            player2={{ id: player2.id, name: player2.name }}
            currentUserId={user?.id ?? null}
            existingRating={existingRating}
          />
        </div>
      )}

      {/* Rating panel */}
      <div className="mb-6">
        <RatingPanel
          aggregate={aggregate}
        />
      </div>

      {/* Player of the match */}
      {playerAggregates.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Player Awards</h2>
          <PlayerOfMatch aggregates={playerAggregates} />
        </div>
      )}

      {/* Discussion */}
      <div className="mb-8">
        <MatchDiscussion
          matchId={id}
          initialComments={comments}
          currentUser={currentUserProfile}
        />
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
            Reviews ({reviews.length})
          </h2>
          <div className="flex flex-col gap-3">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} currentUserId={user?.id ?? null} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
