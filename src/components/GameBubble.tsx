import { gameMeta } from '../data/games'
import { useAppStore } from '../store/appStore'
import type { GamePayload, GameSession } from '../types'
import { GamePreview } from './GamePreview'
import { GameTile } from './GameTile'

export function GameBubble({
  session,
  name,
  snapshot,
  latest,
}: {
  session: GameSession
  name: string
  snapshot?: GamePayload
  latest?: boolean
}) {
  const openOverlay = useAppStore((s) => s.openOverlay)
  const rematch = useAppStore((s) => s.rematch)
  const meta = gameMeta(session.gameId)
  const view = { ...session, payload: snapshot ?? session.payload }
  const done = session.status === 'complete'
  const status = !latest
    ? 'Sent'
    : done
      ? session.payload.kind === 'wordHunt'
        ? `${session.payload.myScore.toLocaleString()} – ${session.payload.theirScore.toLocaleString()}`
        : session.series.me === session.series.them
          ? 'Draw'
          : session.series.me > session.series.them
            ? 'You won'
            : `${name} won`
      : session.turn === 'me'
        ? 'Your turn'
        : `${name}'s turn`

  return (
    <div className="w-[78%] overflow-hidden rounded-[20px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-black/6">
      <button type="button" onClick={() => openOverlay(session.id)} className="block w-full text-left">
        <div className="flex items-center gap-2 px-3 pt-2.5">
          <GameTile gameId={session.gameId} size="sm" className="h-8 w-8 rounded-[10px]" />
          <p className="type-chrome font-semibold text-ink">{meta.name}</p>
          {(session.series.me > 0 || session.series.them > 0) && (
            <p className="type-chrome ml-auto tabular-nums text-stone">
              {session.series.me}–{session.series.them}
            </p>
          )}
        </div>
        <div className="mx-2.5 my-2 overflow-hidden rounded-[12px] bg-[#eef1f4]">
          <GamePreview session={view} />
        </div>
        <p className="type-chrome px-3 pt-0.5 pb-2.5 font-medium text-stone">{status}</p>
      </button>
      {done && latest && (
        <button
          type="button"
          onClick={() => openOverlay(rematch(session.id))}
          className="type-chrome w-full border-t border-black/6 py-2.5 text-center font-semibold text-kohlrabi"
        >
          Rematch
        </button>
      )}
    </div>
  )
}
