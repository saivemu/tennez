'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { RateMatchModal } from '@/components/match/RateMatchModal'

interface Player { id: string; name: string }

interface RateButtonProps {
  matchId: string
  player1: Player
  player2: Player
  currentUserId: string | null
  existingRating?: {
    overall_score: number
    entertainment: number | null
    level_of_play: number | null
    umpiring: number | null
    crowd: number | null
  } | null
}

export function RateButton({ matchId, player1, player2, currentUserId, existingRating }: RateButtonProps) {
  const [open, setOpen] = useState(false)

  if (!currentUserId) {
    return (
      <a
        href="/auth/login"
        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover"
      >
        <Star size={14} />
        Rate Match
      </a>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover"
      >
        <Star size={14} />
        {existingRating ? 'Edit Rating' : 'Rate Match'}
      </button>

      {open && (
        <RateMatchModal
          matchId={matchId}
          player1={player1}
          player2={player2}
          existingRating={existingRating}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
