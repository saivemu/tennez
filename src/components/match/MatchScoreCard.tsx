import { SurfaceBadge } from '@/components/ui/SurfaceBadge'

interface Player {
  id: string
  name: string
  country_code: string | null
  photo_url: string | null
  seed?: number | null
}

interface SetScore { p1: number; p2: number; p1tb?: number; p2tb?: number }

interface PlayerRowProps {
  player: Player
  isWinner: boolean
  isPlayer1: boolean
  sets: SetScore[]
  status: string
  totalSets: number
}

function PlayerRow({ player, isWinner, isPlayer1, sets, status, totalSets }: PlayerRowProps) {
  return (
    <div className={`flex items-center gap-3 ${isWinner ? 'opacity-100' : 'opacity-60'}`}>
      {player.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.photo_url} alt={player.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-elevated text-sm font-bold text-text-secondary">
          {player.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`truncate font-bold ${isWinner ? 'text-text-primary' : 'text-text-secondary'}`}>
          {player.seed && <span className="mr-1 text-xs font-normal text-text-secondary">[{player.seed}]</span>}
          {player.name}
          {player.country_code && <span className="ml-1.5 text-xs font-normal text-text-secondary">{player.country_code}</span>}
        </p>
      </div>
      {/* Set scores */}
      <div className="flex items-center gap-3 font-mono text-sm">
        {sets.map((s, i) => {
          const myScore = isPlayer1 ? s.p1 : s.p2
          const oppScore = isPlayer1 ? s.p2 : s.p1
          const wonSet = myScore > oppScore
          const myTb = isPlayer1 ? s.p1tb : s.p2tb
          return (
            <span key={i} className={wonSet ? 'font-bold text-text-primary' : 'text-text-secondary'}>
              {myScore}
              {myTb !== undefined && myScore === 6 && (
                <sup className="text-[10px]">{myTb}</sup>
              )}
            </span>
          )
        })}
        {status === 'finished' && (
          <span className={`ml-1 text-lg font-black ${isWinner ? 'text-accent' : 'text-text-secondary'}`}>
            {totalSets}
          </span>
        )}
      </div>
    </div>
  )
}

interface MatchScoreCardProps {
  player1: Player
  player2: Player
  winnerId: string | null
  setsJson: unknown
  status: string
  surface: string | null
  round: string | null
  tournamentName: string | null
  courtName: string | null
}

export function MatchScoreCard({
  player1, player2, winnerId, setsJson, status, surface, round, tournamentName, courtName
}: MatchScoreCardProps) {
  const sets: SetScore[] = Array.isArray(setsJson) ? (setsJson as SetScore[]) : []
  const p1Sets = sets.filter(s => s.p1 > s.p2).length
  const p2Sets = sets.filter(s => s.p2 > s.p1).length
  const p1Won = winnerId === player1.id
  const p2Won = winnerId === player2.id

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      {/* Tournament / round header */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {tournamentName && <span className="font-medium text-text-primary">{tournamentName}</span>}
        {round && <span>· {round}</span>}
        {courtName && <span>· {courtName}</span>}
        <SurfaceBadge surface={surface} />
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
          status === 'live' ? 'bg-rating-low/15 text-rating-low' :
          status === 'finished' ? 'bg-bg-elevated text-text-secondary' :
          'bg-accent/10 text-accent'
        }`}>
          {status === 'live' ? '● Live' : status === 'finished' ? 'Final' : 'Upcoming'}
        </span>
      </div>

      {/* Player rows */}
      <div className="flex flex-col gap-4">
        <PlayerRow
          player={player1}
          isWinner={p1Won || status !== 'finished'}
          isPlayer1={true}
          sets={sets}
          status={status}
          totalSets={p1Sets}
        />
        <div className="border-t border-border" />
        <PlayerRow
          player={player2}
          isWinner={p2Won || status !== 'finished'}
          isPlayer1={false}
          sets={sets}
          status={status}
          totalSets={p2Sets}
        />
      </div>
    </div>
  )
}
