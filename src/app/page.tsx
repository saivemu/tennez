import { createClient } from '@/lib/supabase/server'
import { HomeClient } from './HomeClient'
import { fromDateParam } from '@/lib/utils/dates'
import { startOfDay, endOfDay } from 'date-fns'
import type { MatchCardData } from '@/components/match/MatchCard'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const date = dateParam ? fromDateParam(dateParam) : new Date()
  const dayStart = startOfDay(date).toISOString()
  const dayEnd = endOfDay(date).toISOString()

  const supabase = await createClient()

  const { data: matchRows } = await supabase
    .from('matches')
    .select(`
      id, round, status, surface, sets_json, winner_id, scheduled_at,
      player1_seed, player2_seed,
      player1:players!matches_player1_id_fkey(name, country_code, photo_url),
      player2:players!matches_player2_id_fkey(name, country_code, photo_url),
      tournament:tournaments(id, name, logo_url),
      aggregate:match_rating_aggregates(avg_overall, total_ratings)
    `)
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)
    .order('scheduled_at', { ascending: true })

  type PlayerRow = { name: string; country_code?: string | null; photo_url?: string | null } | null
  type TournamentRow = { id: string; name: string; logo_url?: string | null } | null
  type AggRow = { avg_overall: number | null; total_ratings: number } | null

  const matches: (MatchCardData & { scheduled_at: string | null })[] = (matchRows ?? []).map(m => {
    const p1 = (m.player1 as unknown as PlayerRow)
    const p2 = (m.player2 as unknown as PlayerRow)
    return {
      id: m.id,
      player1: {
        name: p1?.name ?? 'TBD',
        country_code: p1?.country_code,
        photo_url: p1?.photo_url,
        seed: m.player1_seed,
      },
      player2: {
        name: p2?.name ?? 'TBD',
        country_code: p2?.country_code,
        photo_url: p2?.photo_url,
        seed: m.player2_seed,
      },
      tournament: (m.tournament as unknown as TournamentRow),
      round: m.round,
      status: m.status,
      surface: m.surface,
      winner_id: m.winner_id,
      sets_json: m.sets_json,
      scheduled_at: m.scheduled_at,
      aggregate: (m.aggregate as unknown as AggRow),
    }
  })

  // Featured: top-rated finished matches
  const featured = [...matches]
    .filter(m => m.status === 'finished' || m.status === 'live')
    .sort((a, b) => (b.aggregate?.total_ratings ?? 0) - (a.aggregate?.total_ratings ?? 0))
    .slice(0, 6)

  // Group by tournament
  const tournamentMap = new Map<string, { id: string; name: string }>()
  for (const m of matches) {
    if (m.tournament) {
      tournamentMap.set(m.tournament.id ?? m.tournament.name, m.tournament as { id: string; name: string })
    }
  }

  const groups = Array.from(tournamentMap.values()).map(t => ({
    tournament: t,
    matches: matches.filter(m => m.tournament?.name === t.name),
  }))

  const statusCounts = {
    live: matches.filter(m => m.status === 'live').length,
    finished: matches.filter(m => m.status === 'finished').length,
    upcoming: matches.filter(m => m.status === 'upcoming').length,
  }

  return (
    <HomeClient
      date={date}
      featured={featured}
      groups={groups}
      statusCounts={statusCounts}
    />
  )
}
