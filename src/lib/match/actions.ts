'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface RatingSubmission {
  matchId: string
  overallScore: number
  entertainment?: number
  levelOfPlay?: number
  umpiring?: number
  crowd?: number
  fanOfPlayerId?: string
  watchingOn?: string
  playerRatings: Array<{
    playerId: string
    score: number
    comment?: string
    isPotm: boolean
    isWorst: boolean
  }>
  reviewBody?: string
}

export type ActionResult = { error: string } | { success: true }

export async function submitMatchRating(data: RatingSubmission): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to rate matches.' }

  // Upsert match rating
  const { error: ratingError } = await supabase
    .from('match_ratings')
    .upsert({
      user_id: user.id,
      match_id: data.matchId,
      overall_score: data.overallScore,
      entertainment: data.entertainment ?? null,
      level_of_play: data.levelOfPlay ?? null,
      umpiring: data.umpiring ?? null,
      crowd: data.crowd ?? null,
      fan_of_player_id: data.fanOfPlayerId ?? null,
      watching_on: data.watchingOn ?? null,
    }, { onConflict: 'user_id,match_id' })

  if (ratingError) return { error: ratingError.message }

  // Upsert player ratings
  for (const pr of data.playerRatings) {
    const { error: prError } = await supabase
      .from('player_match_ratings')
      .upsert({
        user_id: user.id,
        match_id: data.matchId,
        player_id: pr.playerId,
        score: pr.score,
        comment: pr.comment ?? null,
        is_potm: pr.isPotm,
        is_worst: pr.isWorst,
      }, { onConflict: 'user_id,match_id,player_id' })
    if (prError) return { error: prError.message }
  }

  // Optionally insert review
  if (data.reviewBody?.trim()) {
    await supabase.from('reviews').insert({
      user_id: user.id,
      match_id: data.matchId,
      body: data.reviewBody.trim(),
    })
  }

  revalidatePath(`/match/${data.matchId}`)
  return { success: true }
}

export async function postComment(matchId: string, body: string, scoreContext?: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to comment.' }

  const trimmed = body.trim()
  if (!trimmed) return { error: 'Comment cannot be empty.' }
  if (trimmed.length > 500) return { error: 'Comment must be 500 characters or less.' }

  const { error } = await supabase.from('match_comments').insert({
    user_id: user.id,
    match_id: matchId,
    body: trimmed,
    score_context: scoreContext ?? null,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function voteOnReview(reviewId: string, voteType: 'up' | 'down'): Promise<ActionResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to vote.' }

  // Check existing vote
  const { data: existing } = await supabase
    .from('review_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('review_id', reviewId)
    .single()

  if (existing) {
    if (existing.vote_type === voteType) {
      // Remove vote (toggle off)
      await supabase.from('review_votes').delete().eq('id', existing.id)
    } else {
      // Change vote
      await supabase.from('review_votes').update({ vote_type: voteType }).eq('id', existing.id)
    }
  } else {
    const { error } = await supabase.from('review_votes').insert({
      user_id: user.id,
      review_id: reviewId,
      vote_type: voteType,
    })
    if (error) return { error: error.message }
  }

  return null
}

export async function toggleFavoriteMatch(matchId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { data: existing } = await supabase
    .from('favorites_matches')
    .select('match_id')
    .eq('user_id', user.id)
    .eq('match_id', matchId)
    .single()

  if (existing) {
    await supabase.from('favorites_matches').delete()
      .eq('user_id', user.id).eq('match_id', matchId)
  } else {
    await supabase.from('favorites_matches').insert({ user_id: user.id, match_id: matchId })
  }

  revalidatePath(`/match/${matchId}`)
  return { success: true }
}
