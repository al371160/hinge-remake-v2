import { BALL_COLOR, TABLE_H, TABLE_W, isStripe, toPortrait } from '../games/poolPhysics'
import type { GameSession } from '../types'

export function GamePreview({ session }: { session: GameSession }) {
  if (session.payload.kind === 'eightBall') {
    return <EightPreview payload={session.payload} />
  }
  if (session.payload.kind === 'fourInARow') {
    return (
      <div className="grid aspect-[7/6] grid-cols-7 gap-[3px] rounded-[10px] bg-[#1d4b8f] p-1.5">
        {session.payload.cells.map((cell, i) => (
          <span
            key={i}
            className={`aspect-square rounded-full ${
              cell === 1 ? 'bg-[#f0c14b]' : cell === 2 ? 'bg-[#e24b4b]' : 'bg-[#0c2a58]'
            }`}
          />
        ))}
      </div>
    )
  }
  if (session.payload.kind === 'wordHunt') {
    return (
      <div className="grid aspect-square grid-cols-4 gap-0.5 rounded-[10px] bg-[#c9a57a] p-1.5">
        {session.payload.board.map((letter, i) => (
          <span
            key={i}
            className="grid place-items-center rounded-[3px] bg-[#fff8ee] font-ui text-[9px] font-bold text-ink"
          >
            {letter}
          </span>
        ))}
      </div>
    )
  }
  const cups = session.payload.kind === 'cupPong' ? session.payload.cups : []
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-[10px] bg-[#e8d8c8] px-4">
      <div className="flex flex-col items-center gap-1">
        {[4, 3, 2, 1].map((count, row) => (
          <div key={row} className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => {
              const idx = [0, 4, 7, 9][row]! + i
              return (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${cups[idx] ? 'bg-[#c23b2e]' : 'bg-transparent'}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function EightPreview({ payload }: { payload: Extract<GameSession['payload'], { kind: 'eightBall' }> }) {
  const table = toPortrait(payload)
  const w = 100
  const h = 200
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto block h-36 w-[72px] rounded-[8px] bg-[#2f8a3e]">
      {(table.balls ?? [])
        .filter((b) => !b.pocketed)
        .map((b) => (
          <g key={b.id}>
            <circle
              cx={(b.x / TABLE_W) * w}
              cy={(b.y / TABLE_H) * h}
              r={3.4}
              fill={BALL_COLOR[b.id]}
            />
            {isStripe(b.id) && (
              <rect
                x={(b.x / TABLE_W) * w - 3.4}
                y={(b.y / TABLE_H) * h - 1.2}
                width={6.8}
                height={2.4}
                fill="#f7f3ea"
              />
            )}
          </g>
        ))}
      {!table.cue.pocketed && (
        <circle
          cx={(table.cue.x / TABLE_W) * w}
          cy={(table.cue.y / TABLE_H) * h}
          r={3.4}
          fill="#f7f3ea"
        />
      )}
    </svg>
  )
}
