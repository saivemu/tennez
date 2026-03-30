'use client'

import { useRef, useState, useTransition } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useRealtimeComments, type Comment } from '@/hooks/useRealtimeComments'
import { postComment } from '@/lib/match/actions'
import { formatMatchDate } from '@/lib/utils/dates'
import { Send } from 'lucide-react'

interface MatchDiscussionProps {
  matchId: string
  initialComments: Comment[]
  currentUser: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
}

export function MatchDiscussion({ matchId, initialComments, currentUser }: MatchDiscussionProps) {
  const comments = useRealtimeComments(matchId, initialComments)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const listRef = useRef<HTMLDivElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError(null)

    startTransition(async () => {
      const result = await postComment(matchId, body)
      if ('error' in result) {
        setError(result.error)
      } else {
        setBody('')
        // Scroll to bottom
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
      }
    })
  }

  return (
    <section aria-label="Match Discussion">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">Discussion</h2>

      {/* Comment list */}
      <div
        ref={listRef}
        className="mb-4 flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-bg-card p-4"
      >
        {comments.length === 0 ? (
          <p className="text-center text-sm text-text-secondary py-4">No comments yet. Start the discussion!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Avatar
                src={c.user.avatar_url}
                name={c.user.display_name ?? c.user.username}
                size={28}
                className="flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-semibold text-text-primary">
                    {c.user.display_name ?? c.user.username}
                  </span>
                  <span className="text-xs text-text-secondary">{formatMatchDate(c.created_at)}</span>
                  {c.score_context && (
                    <span className="rounded bg-bg-elevated px-1 py-0.5 text-[10px] font-mono text-text-secondary">
                      {c.score_context}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary">{c.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Avatar
            src={currentUser.avatar_url}
            name={currentUser.display_name ?? currentUser.username}
            size={28}
            className="flex-shrink-0 mb-1"
          />
          <div className="flex-1">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Add a comment…"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e as unknown as React.FormEvent)
                }
              }}
            />
            {error && <p className="mt-1 text-xs text-rating-low">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isPending || !body.trim()}
            className="mb-1 rounded-xl bg-accent p-2.5 text-bg-primary hover:bg-accent-hover disabled:opacity-50"
            aria-label="Post comment"
          >
            <Send size={14} />
          </button>
        </form>
      ) : (
        <p className="text-center text-sm text-text-secondary">
          <a href="/auth/login" className="text-accent hover:underline">Sign in</a> to join the discussion.
        </p>
      )}
    </section>
  )
}
