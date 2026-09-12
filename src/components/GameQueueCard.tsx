import { Gamepad2, Play, X } from 'lucide-react'
import { gameMeta } from '../data/games'
import { useAppStore } from '../store/appStore'
import type { GameSession, QueuedGame } from '../types'
import { GamePreview } from './GamePreview'

export function GameQueueCard({
  queued,
  onDismiss,
}: {
  queued: QueuedGame
  onDismiss: () => void
}) {
  const openOverlay = useAppStore((s) => s.openOverlay)
  const meta = gameMeta(queued.gameId)
  const preview: GameSession = {
    id: queued.sessionId,
    threadId: queued.threadId ?? '',
    gameId: queued.gameId,
    status: 'active',
    turn: 'them',
    series: { me: 0, them: 0 },
    payload: queued.payload,
  }

  return (
    <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_2px_12px_rgba(26,26,26,0.08)] ring-1 ring-black/6">
      <div className="flex items-center justify-between px-3 pt-2.5">
        <Gamepad2 className="h-5 w-5 text-stone" strokeWidth={2} />
        <button type="button" onClick={onDismiss} className="grid h-8 w-8 place-items-center" aria-label="Remove">
          <X className="h-5 w-5 text-stone" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => openOverlay(queued.sessionId)}
        className="relative mx-3 mb-2 block w-[calc(100%-24px)] overflow-hidden rounded-[16px] bg-[#eef1f4]"
      >
        <GamePreview session={preview} />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#2a2a2a] ring-[3px] ring-[#8ec63f]">
            <Play className="h-6 w-6 fill-[#8ec63f] text-[#8ec63f]" />
          </span>
        </span>
      </button>
      <p className="px-4 pt-1 pb-3 text-center font-ui text-[18px] font-semibold">
        Let’s play {meta.name}!
      </p>
    </div>
  )
}
