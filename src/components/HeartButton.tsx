import { Heart } from 'lucide-react'
import { cn } from '../lib/cn'

interface Props {
  onClick: () => void
  filled?: boolean
  className?: string
  label?: string
}

export function HeartButton({ onClick, filled, className, label = 'Like this' }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'grid h-11 w-11 place-items-center rounded-full bg-ink text-paper shadow-[0_2px_10px_rgba(26,26,26,0.22)] transition-transform active:scale-90',
        className,
      )}
    >
      <Heart
        className={cn('h-[18px] w-[18px]', filled ? 'fill-paper text-paper' : 'text-paper')}
        strokeWidth={2.5}
      />
    </button>
  )
}
