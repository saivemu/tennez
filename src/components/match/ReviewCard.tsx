'use client'

import { useState, useTransition } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { UpvoteDownvote } from '@/components/ui/UpvoteDownvote'
import { formatMatchDate } from '@/lib/utils/dates'
import { voteOnReview } from '@/lib/match/actions'

export interface ReviewData {
  id: string
  body: string
  created_at: string
  upvotes: number
  downvotes: number
  userVote: 'up' | 'down' | null
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  matchRating?: number | null
}

interface ReviewCardProps {
  review: ReviewData
  currentUserId: string | null
}

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const [upvotes, setUpvotes] = useState(review.upvotes)
  const [downvotes, setDownvotes] = useState(review.downvotes)
  const [userVote, setUserVote] = useState(review.userVote)
  const [isPending, startTransition] = useTransition()

  function handleVote(type: 'up' | 'down') {
    if (!currentUserId) return

    const prevVote = userVote
    const prevUp = upvotes
    const prevDown = downvotes

    // Optimistic update
    if (userVote === type) {
      setUserVote(null)
      if (type === 'up') setUpvotes(v => v - 1)
      else setDownvotes(v => v - 1)
    } else {
      if (userVote === 'up') setUpvotes(v => v - 1)
      if (userVote === 'down') setDownvotes(v => v - 1)
      setUserVote(type)
      if (type === 'up') setUpvotes(v => v + 1)
      else setDownvotes(v => v + 1)
    }

    startTransition(async () => {
      const result = await voteOnReview(review.id, type)
      if (result && 'error' in result) {
        // Revert on error
        setUserVote(prevVote)
        setUpvotes(prevUp)
        setDownvotes(prevDown)
      }
    })
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-4">
      {/* Author + meta */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={review.author.avatar_url}
            name={review.author.display_name ?? review.author.username}
            size={32}
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {review.author.display_name ?? review.author.username}
            </p>
            <p className="text-xs text-text-secondary">
              @{review.author.username} · {formatMatchDate(review.created_at)}
            </p>
          </div>
        </div>
        {review.matchRating != null && (
          <span className="flex-shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
            {review.matchRating}/10
          </span>
        )}
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed text-text-primary">{review.body}</p>

      {/* Voting */}
      <div className="flex items-center justify-end">
        <UpvoteDownvote
          upvotes={upvotes}
          downvotes={downvotes}
          userVote={userVote}
          onVote={handleVote}
          disabled={!currentUserId || isPending}
        />
      </div>
    </article>
  )
}
