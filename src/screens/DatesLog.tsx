import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GrainPhoto } from '../components/GrainPhoto'
import { DATE_OUTINGS } from '../data/dateOutings'
import { useAppStore } from '../store/appStore'

export function DatesLog() {
  const threads = useAppStore((s) => s.threads)
  const reviews = useAppStore((s) => s.dateReviews)
  const profileById = useAppStore((s) => s.profileById)

  const pending = threads.filter((t) => !reviews[t.id])
  const done = threads.filter((t) => reviews[t.id])

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-1 px-2 pt-1 pb-2">
        <Link to="/you" className="grid h-10 w-10 place-items-center" aria-label="Back">
          <ChevronLeft />
        </Link>
        <h1 className="type-title">Dates</h1>
      </header>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {pending.length > 0 && (
          <section className="mt-2">
            <div className="space-y-3">
              {pending.map((t) => {
                const p = profileById(t.profileId)
                if (!p) return null
                const outing = DATE_OUTINGS[t.id]
                return (
                  <Link
                    key={t.id}
                    to={`/matches/${t.id}/review`}
                    className="flex items-center gap-3 rounded-[24px] bg-paper p-3 shadow-[0_2px_10px_rgba(26,26,26,0.06)]"
                  >
                    {p.photos[0] && (
                      <GrainPhoto
                        src={p.photos[0].url}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-2xl"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-ui text-[16px] font-semibold">
                        {p.name}, {p.age}
                      </p>
                      {outing && (
                        <p className="type-chrome truncate text-stone">{outing.place}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section className={pending.length > 0 ? 'mt-7' : 'mt-2'}>
            <div className="space-y-3">
              {done.map((t) => {
                const p = profileById(t.profileId)
                const r = reviews[t.id]
                if (!p || !r) return null
                const outing = DATE_OUTINGS[t.id]
                return (
                  <Link
                    key={t.id}
                    to={`/matches/${t.id}/review`}
                    className="flex items-center gap-3 rounded-[24px] bg-paper p-3 shadow-[0_2px_10px_rgba(26,26,26,0.06)]"
                  >
                    {p.photos[0] && (
                      <GrainPhoto
                        src={p.photos[0].url}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-2xl"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-ui text-[16px] font-semibold">
                        {p.name}, {p.age}
                      </p>
                      {r.met === 'yes' && outing && (
                        <p className="type-chrome truncate text-stone">{outing.place}</p>
                      )}
                    </div>
                    {r.met === 'yes' && r.overall ? (
                      <span className="type-chrome font-semibold text-coral">{r.overall}/5</span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
