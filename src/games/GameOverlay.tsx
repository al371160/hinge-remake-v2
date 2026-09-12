import { X } from 'lucide-react'
import { gameMeta } from '../data/games'
import { useAppStore } from '../store/appStore'
import { CupPong } from './CupPong'
import { EightBall } from './EightBall'
import { FourInARow } from './FourInARow'
import { WordHunt } from './WordHunt'

export function GameOverlay() {
  const id = useAppStore((s) => s.overlaySessionId)
  const session = useAppStore((s) => (id ? s.sessions[id] : undefined))
  const close = useAppStore((s) => s.closeOverlay)
  const finishWordHunt = useAppStore((s) => s.finishWordHunt)
  const playFour = useAppStore((s) => s.playFour)
  const playCupShot = useAppStore((s) => s.playCupShot)
  const playEightShot = useAppStore((s) => s.playEightShot)

  if (!id || !session) return null

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col ${
        session.gameId === 'eightBall' ? 'bg-[#1c1612]' : 'bg-canvas'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 pb-1 ${
          session.gameId === 'eightBall' ? 'pt-11' : 'pt-12'
        }`}
      >
        <p
          className={`type-chrome font-semibold ${
            session.gameId === 'eightBall' ? 'text-white/50' : 'text-stone'
          }`}
        >
          {session.gameId === 'eightBall' ? '' : gameMeta(session.gameId).name}
        </p>
        <button
          type="button"
          onClick={close}
          className={`grid h-10 w-10 place-items-center ${
            session.gameId === 'eightBall' ? 'text-white' : 'text-ink'
          }`}
          aria-label="Close"
        >
          <X />
        </button>
      </div>
      <div className="min-h-0 flex-1">
        {session.payload.kind === 'wordHunt' &&
          session.status !== 'complete' &&
          !session.payload.myPlayed && (
          <WordHunt
            key={session.id}
            board={session.payload.board}
            onFinish={(words, score) => {
              finishWordHunt(session.id, words, score)
            }}
          />
        )}
        {session.payload.kind === 'wordHunt' &&
          session.status !== 'complete' &&
          session.payload.myPlayed && (
          <div className="px-6 pt-4">
            <p className="type-title">{session.payload.myScore.toLocaleString()}</p>
            <p className="type-chrome mt-1 text-stone">Sent</p>
            <p className="type-user mt-6">{session.payload.myWords.join(', ') || '—'}</p>
          </div>
        )}
        {session.payload.kind === 'wordHunt' && session.status === 'complete' && (
          <WordHuntResult
            mine={session.payload.myWords}
            theirs={session.payload.theirWords}
            myScore={session.payload.myScore}
            theirScore={session.payload.theirScore}
          />
        )}
        {session.payload.kind === 'fourInARow' && (
          <FourInARow
            key={session.id}
            payload={session.payload}
            disabled={session.turn !== 'me' || session.status === 'complete'}
            onPlay={(col) => playFour(session.id, col)}
          />
        )}
        {session.payload.kind === 'cupPong' && (
          <CupPong
            key={session.id}
            payload={session.payload}
            disabled={session.turn !== 'me' || session.status === 'complete'}
            onShot={(i) => playCupShot(session.id, i)}
          />
        )}
        {session.payload.kind === 'eightBall' && (
          <EightBall
            key={session.id}
            payload={session.payload}
            turn={session.turn}
            finished={session.status === 'complete'}
            onShot={(next, keepTurn) => playEightShot(session.id, next, keepTurn)}
          />
        )}
      </div>
    </div>
  )
}

function WordHuntResult({
  mine,
  theirs,
  myScore,
  theirScore,
}: {
  mine: string[]
  theirs: string[]
  myScore: number
  theirScore: number
}) {
  return (
    <div className="h-full overflow-y-auto px-6 pb-8">
      <p className="type-title">
        {myScore === theirScore ? 'Draw' : myScore > theirScore ? 'You won' : 'They won'}
      </p>
      <p className="type-chrome mt-1 text-stone">
        {myScore.toLocaleString()} – {theirScore.toLocaleString()}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="type-chrome font-semibold text-stone">You</p>
          <p className="type-user mt-2">{mine.join(', ') || '—'}</p>
        </div>
        <div>
          <p className="type-chrome font-semibold text-stone">Them</p>
          <p className="type-user mt-2">{theirs.join(', ') || '—'}</p>
        </div>
      </div>
    </div>
  )
}
