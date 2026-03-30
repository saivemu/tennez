'use client'

import { useState, useTransition } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Slider } from '@/components/ui/Slider'
import { submitMatchRating } from '@/lib/match/actions'

interface Player { id: string; name: string }

interface RateMatchModalProps {
  matchId: string
  player1: Player
  player2: Player
  existingRating?: {
    overall_score: number
    entertainment: number | null
    level_of_play: number | null
    umpiring: number | null
    crowd: number | null
  } | null
  onClose: () => void
}

type Step = 'overall' | 'players' | 'review'

export function RateMatchModal({ matchId, player1, player2, existingRating, onClose }: RateMatchModalProps) {
  const [step, setStep] = useState<Step>('overall')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Overall + indicators
  const [overall, setOverall] = useState(existingRating?.overall_score ?? 7)
  const [entertainment, setEntertainment] = useState(existingRating?.entertainment ?? 7)
  const [levelOfPlay, setLevelOfPlay] = useState(existingRating?.level_of_play ?? 7)
  const [umpiring, setUmpiring] = useState(existingRating?.umpiring ?? 7)
  const [crowd, setCrowd] = useState(existingRating?.crowd ?? 7)

  // Player ratings
  const [p1Score, setP1Score] = useState(7)
  const [p1Comment, setP1Comment] = useState('')
  const [p1Potm, setP1Potm] = useState(false)
  const [p1Worst, setP1Worst] = useState(false)
  const [p2Score, setP2Score] = useState(7)
  const [p2Comment, setP2Comment] = useState('')
  const [p2Potm, setP2Potm] = useState(false)
  const [p2Worst, setP2Worst] = useState(false)

  // Review
  const [reviewBody, setReviewBody] = useState('')

  const STEPS: Step[] = ['overall', 'players', 'review']
  const stepIdx = STEPS.indexOf(step)

  function goNext() {
    const next = STEPS[stepIdx + 1]
    if (next) setStep(next)
  }

  function goPrev() {
    const prev = STEPS[stepIdx - 1]
    if (prev) setStep(prev)
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await submitMatchRating({
        matchId,
        overallScore: overall,
        entertainment,
        levelOfPlay,
        umpiring,
        crowd,
        playerRatings: [
          { playerId: player1.id, score: p1Score, comment: p1Comment || undefined, isPotm: p1Potm, isWorst: p1Worst },
          { playerId: player2.id, score: p2Score, comment: p2Comment || undefined, isPotm: p2Potm, isWorst: p2Worst },
        ],
        reviewBody: reviewBody || undefined,
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-border bg-bg-elevated p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Rate Match</h2>
            <p className="text-xs text-text-secondary">Step {stepIdx + 1} of {STEPS.length}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-card hover:text-text-primary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIdx ? 'bg-accent' : 'bg-border'}`}
            />
          ))}
        </div>

        {/* Step: Overall */}
        {step === 'overall' && (
          <div className="flex flex-col gap-5">
            <Slider value={overall} onChange={setOverall} label="Overall Match Rating" />
            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">Optional Indicators</p>
              <div className="flex flex-col gap-4">
                <Slider value={entertainment} onChange={setEntertainment} label="Entertainment" />
                <Slider value={levelOfPlay} onChange={setLevelOfPlay} label="Level of Play" />
                <Slider value={umpiring} onChange={setUmpiring} label="Umpiring" />
                <Slider value={crowd} onChange={setCrowd} label="Crowd" />
              </div>
            </div>
          </div>
        )}

        {/* Step: Players */}
        {step === 'players' && (
          <div className="flex flex-col gap-6">
            {[
              { player: player1, score: p1Score, setScore: setP1Score, comment: p1Comment, setComment: setP1Comment, potm: p1Potm, setPotm: setP1Potm, worst: p1Worst, setWorst: setP1Worst },
              { player: player2, score: p2Score, setScore: setP2Score, comment: p2Comment, setComment: setP2Comment, potm: p2Potm, setPotm: setP2Potm, worst: p2Worst, setWorst: setP2Worst },
            ].map(({ player, score, setScore, comment, setComment, potm, setPotm, worst, setWorst }) => (
              <div key={player.id} className="rounded-xl border border-border bg-bg-card p-4">
                <p className="mb-3 font-semibold text-text-primary">{player.name}</p>
                <Slider value={score} onChange={setScore} label="Performance" />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { setPotm(!potm); if (!potm) setWorst(false) }}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                      potm ? 'bg-rating-high/15 text-rating-high ring-1 ring-rating-high/50' : 'border border-border text-text-secondary hover:border-rating-high hover:text-rating-high'
                    }`}
                  >
                    ⭐ POTM
                  </button>
                  <button
                    onClick={() => { setWorst(!worst); if (!worst) setPotm(false) }}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                      worst ? 'bg-rating-low/15 text-rating-low ring-1 ring-rating-low/50' : 'border border-border text-text-secondary hover:border-rating-low hover:text-rating-low'
                    }`}
                  >
                    👎 Underperformed
                  </button>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Optional comment about this player…"
                  maxLength={280}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary">Write an optional review about the match.</p>
            <textarea
              value={reviewBody}
              onChange={e => setReviewBody(e.target.value)}
              placeholder="Share your thoughts on this match…"
              maxLength={2000}
              rows={6}
              className="w-full resize-none rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
            <p className="text-right text-xs text-text-secondary">{reviewBody.length}/2000</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-lg bg-rating-low/10 px-3 py-2 text-sm text-rating-low" role="alert">{error}</p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {stepIdx > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:border-accent hover:text-text-primary"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step !== 'review' ? (
            <button
              onClick={goNext}
              className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="ml-auto rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover disabled:opacity-60"
            >
              {isPending ? 'Submitting…' : 'Submit Rating'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
