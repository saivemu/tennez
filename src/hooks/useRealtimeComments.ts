'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Comment {
  id: string
  body: string
  score_context: string | null
  created_at: string
  user: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export function useRealtimeComments(matchId: string, initialComments: Comment[]) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    channelRef.current = supabase
      .channel(`match-comments-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_comments',
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          const newComment: Comment = {
            id: payload.new.id,
            body: payload.new.body,
            score_context: payload.new.score_context,
            created_at: payload.new.created_at,
            user: profileData ?? { username: 'unknown', display_name: null, avatar_url: null },
          }

          setComments(prev => [...prev, newComment])
        }
      )
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [matchId, supabase])

  return comments
}
