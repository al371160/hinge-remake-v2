import { cn } from '../lib/cn'
import type { GameId } from '../types'

interface Props {
  gameId: GameId
  selected?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function GameTile({ gameId, selected, size = 'md', className }: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[18px] shadow-[0_2px_8px_rgba(26,26,26,0.12)]',
        size === 'md' ? 'aspect-square' : 'h-14 w-14',
        selected ? 'ring-2 ring-ink' : 'ring-1 ring-black/5',
        className,
      )}
    >
      {gameId === 'eightBall' && <EightFace />}
      {gameId === 'wordHunt' && <WordHuntFace />}
      {gameId === 'fourInARow' && <FourFace />}
      {gameId === 'cupPong' && <CupFace />}
    </div>
  )
}

function EightFace() {
  return (
    <div className="relative h-full bg-[#2d8a40]">
      <span className="absolute top-[18%] left-[22%] h-[18%] w-[18%] rounded-full bg-[#E8B423]" />
      <span className="absolute top-[28%] left-[48%] h-[16%] w-[16%] rounded-full bg-[#1E4FA3]" />
      <span className="absolute top-[46%] left-[30%] h-[22%] w-[22%] rounded-full bg-[#111] ring-[3px] ring-[#f7f3ea]" />
      <span className="absolute top-[22%] right-[18%] h-[16%] w-[16%] rounded-full bg-[#f7f3ea]" />
      <span className="absolute right-[28%] bottom-[20%] h-[14%] w-[14%] rounded-full bg-[#C62828]" />
    </div>
  )
}

function WordHuntFace() {
  const letters = ['D', 'A', 'T', 'E', 'K', 'I', 'S', 'S', 'L', 'O', 'V', 'E', 'R', 'U', 'N', 'S']
  return (
    <div className="grid h-full grid-cols-4 gap-0.5 bg-[#c9a57a] p-1.5">
      {letters.map((l, i) => (
        <span
          key={i}
          className="grid place-items-center rounded-[3px] bg-[#fff8f0] font-ui text-[9px] font-bold text-ink"
        >
          {l}
        </span>
      ))}
    </div>
  )
}

function FourFace() {
  return (
    <div className="grid h-full grid-cols-4 content-center gap-1 bg-[#1d4b8f] p-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className={`aspect-square rounded-full ${
            i === 5 || i === 6 || i === 9 ? 'bg-[#f0c14b]' : i === 10 ? 'bg-[#e24b4b]' : 'bg-[#0c2a58]'
          }`}
        />
      ))}
    </div>
  )
}

function CupFace() {
  return (
    <div className="flex h-full items-end justify-center gap-1 bg-[#e8d8c8] pb-2">
      <Cup />
      <Cup raised />
      <Cup />
    </div>
  )
}

function Cup({ raised }: { raised?: boolean }) {
  return (
    <span
      className={`block w-[22%] rounded-b-md bg-[#c23b2e] ${raised ? 'h-[42%]' : 'h-[34%]'}`}
      style={{ clipPath: 'polygon(12% 0, 88% 0, 100% 100%, 0 100%)' }}
    />
  )
}
