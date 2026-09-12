import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { INTENTIONS } from '../data/studio'
import { formatHeight } from '../lib/filters'
import { cn } from '../lib/cn'
import { useAppStore } from '../store/appStore'

type Sheet = 'signals' | 'age' | 'height' | 'intent' | null

export function FilterBar() {
  const prefs = useAppStore((s) => s.preferences)
  const setPreferences = useAppStore((s) => s.setPreferences)
  const [sheet, setSheet] = useState<Sheet>(null)

  return (
    <>
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-4 pt-2 pb-3">
        <button
          type="button"
          aria-label="Signals"
          onClick={() => setSheet('signals')}
          className="grid h-9 w-9 shrink-0 place-items-center text-ink"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
        <FilterChip
          label="Signals"
          selected={sheet === 'signals'}
          chevron={false}
          onClick={() => setSheet('signals')}
        />
        <FilterChip
          label="Age"
          selected={sheet === 'age' || sheet === null}
          onClick={() => setSheet('age')}
        />
        <FilterChip label="Height" selected={sheet === 'height'} onClick={() => setSheet('height')} />
        <FilterChip
          label="Dating Intent"
          selected={sheet === 'intent'}
          onClick={() => setSheet('intent')}
        />
      </div>

      {sheet && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setSheet(null)}
          />
          <div className="relative rounded-t-[24px] bg-canvas px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-pebble" />

            {sheet === 'signals' && (
              <SheetBlock title="Signals">
                <ToggleRow
                  label="Nearby"
                  hint={`Within ${prefs.distance} miles`}
                  on={prefs.nearby}
                  onClick={() => setPreferences({ nearby: !prefs.nearby })}
                />
                {prefs.nearby && (
                  <Stepper
                    label="Distance"
                    value={`${prefs.distance} mi`}
                    onMinus={() => setPreferences({ distance: Math.max(1, prefs.distance - 1) })}
                    onPlus={() => setPreferences({ distance: Math.min(50, prefs.distance + 1) })}
                  />
                )}
              </SheetBlock>
            )}

            {sheet === 'age' && (
              <SheetBlock title="Age">
                <Stepper
                  label="From"
                  value={String(prefs.ageMin)}
                  onMinus={() => setPreferences({ ageMin: Math.max(18, prefs.ageMin - 1) })}
                  onPlus={() =>
                    setPreferences({ ageMin: Math.min(prefs.ageMax, prefs.ageMin + 1) })
                  }
                />
                <Stepper
                  label="To"
                  value={String(prefs.ageMax)}
                  onMinus={() =>
                    setPreferences({ ageMax: Math.max(prefs.ageMin, prefs.ageMax - 1) })
                  }
                  onPlus={() => setPreferences({ ageMax: Math.min(80, prefs.ageMax + 1) })}
                />
              </SheetBlock>
            )}

            {sheet === 'height' && (
              <SheetBlock title="Height">
                <Stepper
                  label="From"
                  value={formatHeight(prefs.heightMin)}
                  onMinus={() => setPreferences({ heightMin: Math.max(56, prefs.heightMin - 1) })}
                  onPlus={() =>
                    setPreferences({
                      heightMin: Math.min(prefs.heightMax, prefs.heightMin + 1),
                    })
                  }
                />
                <Stepper
                  label="To"
                  value={formatHeight(prefs.heightMax)}
                  onMinus={() =>
                    setPreferences({
                      heightMax: Math.max(prefs.heightMin, prefs.heightMax - 1),
                    })
                  }
                  onPlus={() => setPreferences({ heightMax: Math.min(84, prefs.heightMax + 1) })}
                />
              </SheetBlock>
            )}

            {sheet === 'intent' && (
              <SheetBlock title="Dating intent">
                <div className="flex flex-wrap gap-2">
                  {['', ...INTENTIONS].map((intent) => {
                    const selected = prefs.datingIntent === intent
                    return (
                      <button
                        key={intent || 'any'}
                        type="button"
                        onClick={() => setPreferences({ datingIntent: intent })}
                        className={cn(
                          'type-chrome rounded-full px-3.5 py-2 font-semibold',
                          selected ? 'bg-ink text-paper' : 'bg-paper text-ink',
                        )}
                      >
                        {intent || 'Any'}
                      </button>
                    )
                  })}
                </div>
              </SheetBlock>
            )}

            <button
              type="button"
              onClick={() => setSheet(null)}
              className="type-chrome mt-5 h-12 w-full rounded-full bg-ink font-bold text-paper"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function FilterChip({
  label,
  onClick,
  selected,
  chevron = true,
}: {
  label: string
  onClick: () => void
  selected?: boolean
  chevron?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'type-chrome flex h-9 shrink-0 items-center gap-1 rounded-full px-3.5 font-medium',
        selected ? 'bg-ink text-paper' : 'bg-white text-ink pill',
      )}
    >
      {label}
      {chevron && <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
    </button>
  )
}

function SheetBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="type-title">{title}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string
  value: string
  onMinus: () => void
  onPlus: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-[20px] bg-paper px-4 py-3">
      <p className="type-chrome text-stone">{label}</p>
      <div className="flex items-center gap-3">
        <StepButton label={`Decrease ${label}`} onClick={onMinus}>
          –
        </StepButton>
        <span className="type-chrome min-w-12 text-center font-semibold">{value}</span>
        <StepButton label={`Increase ${label}`} onClick={onPlus}>
          +
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  children,
  onClick,
  label,
}: {
  children: ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="type-chrome grid h-9 w-9 place-items-center rounded-full bg-white font-bold pill"
    >
      {children}
    </button>
  )
}

function ToggleRow({
  label,
  hint,
  on,
  onClick,
}: {
  label: string
  hint: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[20px] bg-paper px-4 py-3 text-left"
    >
      <span>
        <span className="type-chrome block font-semibold">{label}</span>
        <span className="type-chrome mt-0.5 block text-stone">{hint}</span>
      </span>
      <span className={cn('h-6 w-11 rounded-full p-0.5', on ? 'bg-ink' : 'bg-pebble')}>
        <span
          className={cn(
            'block h-5 w-5 rounded-full bg-white transition-transform',
            on && 'translate-x-5',
          )}
        />
      </span>
    </button>
  )
}
