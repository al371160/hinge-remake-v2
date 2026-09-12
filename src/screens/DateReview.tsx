import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CapsuleButton } from '../components/CapsuleButton'
import { GrainPhoto } from '../components/GrainPhoto'
import { ScoreDots, StarRow } from '../components/StarRow'
import { DATE_OUTINGS, DATE_TAGS } from '../data/dateOutings'
import { useAppStore } from '../store/appStore'
import type { DateReview } from '../types'

export function DateReviewScreen() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const thread = useAppStore((s) => s.threads.find((t) => t.id === threadId))
  const profile = useAppStore((s) => (thread ? s.profileById(thread.profileId) : undefined))
  const existing = useAppStore((s) => (threadId ? s.dateReviews[threadId] : undefined))
  const saveDateReview = useAppStore((s) => s.saveDateReview)

  const [met, setMet] = useState<DateReview['met'] | null>(existing?.met ?? null)
  const [again, setAgain] = useState<boolean | undefined>(existing?.again)
  const [note, setNote] = useState(existing?.note ?? '')
  const [overall, setOverall] = useState(existing?.overall ?? 0)
  const [chemistry, setChemistry] = useState(existing?.chemistry ?? 0)
  const [conversation, setConversation] = useState(existing?.conversation ?? 0)
  const [safety, setSafety] = useState(existing?.safety ?? 0)
  const [tags, setTags] = useState<string[]>(existing?.tags ?? [])

  if (!thread || !profile || !threadId) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas">
        <p className="type-title">Gone</p>
      </div>
    )
  }

  const outing = DATE_OUTINGS[threadId]
  const photo = profile.photos[0]
  const toggleTag = (tag: string) => {
    setTags((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]))
  }

  const save = () => {
    if (!met) return
    saveDateReview(threadId, {
      met,
      again: met === 'yes' ? again : undefined,
      note: note.trim() || undefined,
      overall: met === 'yes' ? overall || undefined : undefined,
      chemistry: met === 'yes' ? chemistry || undefined : undefined,
      conversation: met === 'yes' ? conversation || undefined : undefined,
      safety: met === 'yes' ? safety || undefined : undefined,
      tags: met === 'yes' && tags.length ? tags : undefined,
    })
    navigate('/you/dates')
  }

  const canSave = Boolean(met) && (met !== 'yes' || (again !== undefined && overall > 0))

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-1 px-2 pt-1 pb-2">
        <Link to={`/matches/${thread.id}`} className="grid h-10 w-10 place-items-center" aria-label="Back">
          <ChevronLeft />
        </Link>
        <p className="type-title">{profile.name}</p>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="overflow-hidden rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
          {photo && <GrainPhoto src={photo.url} alt={profile.name} className="h-52 w-full" />}
          <div className="px-5 py-4">
            <p className="type-chrome text-stone">
              {profile.age}
              {outing ? ` · ${outing.when}` : ''}
            </p>
            {outing && <p className="type-user mt-1">{outing.place}</p>}
          </div>
        </div>

        <p className="type-title mt-6">Meet?</p>
        <div className="mt-3 flex gap-2">
          {(
            [
              ['yes', 'Yes'],
              ['notYet', 'Not yet'],
              ['no', 'No'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMet(value)}
              className={`type-chrome h-12 flex-1 rounded-full font-bold ${
                met === value ? 'bg-ink text-paper' : 'bg-paper text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {met === 'yes' && (
          <>
            <div className="mt-6 rounded-[24px] bg-paper px-5 py-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
              <StarRow value={overall} onChange={setOverall} />
              <div className="mt-5 space-y-3.5">
                <ScoreDots label="Chemistry" value={chemistry} onChange={setChemistry} />
                <ScoreDots label="Conversation" value={conversation} onChange={setConversation} />
                <ScoreDots label="Safety" value={safety} onChange={setSafety} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {DATE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`type-chrome rounded-full px-3 py-1.5 font-medium ${
                    tags.includes(tag) ? 'bg-ink text-paper' : 'bg-pebble text-ink'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="type-title mt-6">Again?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAgain(true)}
                className={`type-chrome h-14 rounded-full font-bold ${
                  again === true ? 'bg-ink text-paper' : 'bg-paper text-ink'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAgain(false)}
                className={`type-chrome h-14 rounded-full font-bold ${
                  again === false ? 'bg-ink text-paper' : 'bg-paper text-ink'
                }`}
              >
                No
              </button>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Note"
              className="field type-user mt-4 placeholder:font-ui placeholder:text-[13px]"
            />
          </>
        )}
      </div>

      <div className="px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
        <CapsuleButton onClick={save} disabled={!canSave}>
          Save
        </CapsuleButton>
      </div>
    </div>
  )
}
