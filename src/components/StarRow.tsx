import { cn } from '../lib/cn'

interface Props {
  value: number
  onChange: (n: number) => void
  label?: string
}

export function StarRow({ value, onChange, label }: Props) {
  return (
    <div>
      {label && <p className="type-chrome font-medium text-stone">{label}</p>}
      <div className={cn('flex gap-2', label && 'mt-2')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange(n)}
            className="grid h-10 w-10 place-items-center"
          >
            <svg viewBox="0 0 24 24" className="h-8 w-8">
              <path
                d="M12 2.6 14.7 8l6 .9-4.3 4.2 1 5.9L12 16.2 6.6 19l1-5.9L3.3 8.9 9.3 8 12 2.6z"
                className={n <= value ? 'fill-coral' : 'fill-none stroke-sand'}
                strokeWidth={n <= value ? 0 : 2.2}
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ScoreDots({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="type-chrome text-ink">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n}`}
            onClick={() => onChange(n)}
            className={cn(
              'h-3.5 w-3.5 rounded-full',
              n <= value ? 'bg-ink' : 'bg-pebble',
            )}
          />
        ))}
      </div>
    </div>
  )
}
