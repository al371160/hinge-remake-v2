import type { FourInARowPayload } from '../types'

interface Props {
  payload: FourInARowPayload
  disabled?: boolean
  onPlay: (col: number) => void
}

export function FourInARow({ payload, disabled, onPlay }: Props) {
  const status =
    payload.winner === 1
      ? 'You won'
      : payload.winner === 2
        ? 'They won'
        : disabled
          ? 'Their turn'
          : 'Your turn'

  return (
    <div className="flex h-full flex-col bg-[#e8eef6] px-6 pt-3 pb-8">
      <p className="type-chrome font-semibold">{status}</p>
      <div className="flex flex-1 items-center">
        <div className="w-full rounded-[26px] bg-[#1d4b8f] p-4 shadow-[0_10px_24px_rgba(13,40,80,0.28)]">
          <div className="grid grid-cols-7 gap-2">
            {payload.cells.map((cell, i) => {
              const col = i % 7
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled || payload.winner !== 0}
                  onClick={() => onPlay(col)}
                  className="aspect-square"
                >
                  <span
                    className={`block h-full w-full rounded-full shadow-inner ${
                      cell === 1
                        ? 'bg-[#f0c14b]'
                        : cell === 2
                          ? 'bg-[#e24b4b]'
                          : 'bg-[#0c2a58]'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
