import type { Vitals } from '../types'

export function VitalsRow({ vitals }: { vitals: Vitals }) {
  const chips = [
    vitals.job,
    vitals.education,
    vitals.height,
    vitals.hometown && `From ${vitals.hometown}`,
    vitals.intentions,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {chips.map((c) => (
        <span
          key={c}
          className="type-chrome rounded-full bg-pebble px-3 py-1.5 font-medium text-ink"
        >
          {c}
        </span>
      ))}
    </div>
  )
}
