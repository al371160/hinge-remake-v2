import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { PromptPoll } from '../types'

interface Props {
  poll: PromptPoll
  onLike?: (option: string) => void
}

export function PromptPollCard({ poll, onLike }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <article className="rounded-[24px] bg-paper px-5 py-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      <p className="type-chrome font-semibold tracking-[0.14em] text-stone uppercase">Poll</p>
      <p className="type-chrome mt-2 text-stone">{poll.question}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="type-chrome mt-4 flex w-full items-center justify-between rounded-full bg-pebble px-4 py-3 font-medium text-ink"
      >
        <span>{open ? '' : '—'}</span>
        <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
      </button>
      {open && (
        <ul className="mt-2 overflow-hidden rounded-2xl bg-white">
          {poll.options.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLike?.(option)
                }}
                className="type-user w-full px-4 py-3 text-left"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
