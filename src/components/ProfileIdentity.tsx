import { BadgeCheck, RotateCcw } from 'lucide-react'
import type { Profile } from '../types'

interface Props {
  profile: Profile
  onUndo?: () => void
  canUndo?: boolean
  onMore?: () => void
}

export function ProfileIdentity({ profile, onUndo, canUndo, onMore }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 px-1 pb-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="type-title text-ink">
            {profile.name || 'Someone new'}
          </h1>
          {profile.newHere && (
            <span className="type-chrome rounded-full bg-kohlrabi/12 px-2 py-0.5 font-semibold text-kohlrabi">
              New
            </span>
          )}
        </div>
        <p className="type-chrome mt-1.5 flex items-center gap-1.5 text-stone">
          {profile.pronouns && <span>{profile.pronouns}</span>}
          {profile.pronouns && profile.verified && <span aria-hidden>·</span>}
          {profile.verified && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-kohlrabi">
              <BadgeCheck className="h-3.5 w-3.5 fill-kohlrabi text-paper" />
              Verified
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 pt-1">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo skip"
            className="grid h-9 w-9 place-items-center text-ink disabled:opacity-25"
          >
            <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </button>
        )}
        <button
          type="button"
          aria-label="More"
          onClick={onMore}
          className="grid h-9 w-9 place-items-center text-ink"
        >
          <span className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-ink" />
            <span className="h-1 w-1 rounded-full bg-ink" />
            <span className="h-1 w-1 rounded-full bg-ink" />
          </span>
        </button>
      </div>
    </div>
  )
}
