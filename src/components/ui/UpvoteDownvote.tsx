'use client'

import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface UpvoteDownvoteProps {
  upvotes: number
  downvotes: number
  userVote: 'up' | 'down' | null
  onVote: (type: 'up' | 'down') => void
  disabled?: boolean
  className?: string
}

export function UpvoteDownvote({
  upvotes,
  downvotes,
  userVote,
  onVote,
  disabled = false,
  className = '',
}: UpvoteDownvoteProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onVote('up')}
        disabled={disabled}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          userVote === 'up'
            ? 'bg-rating-high/15 text-rating-high'
            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
        }`}
        aria-label={`Upvote (${upvotes})`}
        aria-pressed={userVote === 'up'}
      >
        <ThumbsUp size={13} />
        <span>{upvotes}</span>
      </button>
      <button
        onClick={() => onVote('down')}
        disabled={disabled}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          userVote === 'down'
            ? 'bg-rating-low/15 text-rating-low'
            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
        }`}
        aria-label={`Downvote (${downvotes})`}
        aria-pressed={userVote === 'down'}
      >
        <ThumbsDown size={13} />
        <span>{downvotes}</span>
      </button>
    </div>
  )
}
