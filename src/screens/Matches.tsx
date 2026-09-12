import { ClipboardCheck, ClipboardList, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GameTile } from '../components/GameTile'
import { GrainPhoto } from '../components/GrainPhoto'
import { TypingDots } from '../components/TypingDots'
import { cn } from '../lib/cn'
import { threadTurn, useAppStore } from '../store/appStore'

export function Matches() {
  const threads = useAppStore((s) => s.threads)
  const sessions = useAppStore((s) => s.sessions)
  const profileById = useAppStore((s) => s.profileById)

  const yours = threads.filter((t) => threadTurn(t, sessions) === 'me')
  const theirs = threads.filter((t) => threadTurn(t, sessions) === 'them')

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="px-5 pt-2 pb-3">
        <h1 className="type-title">Matches</h1>
      </header>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        {threads.length === 0 && <p className="type-chrome mt-16 text-center text-stone">None yet</p>}
        {yours.length > 0 && (
          <section>
            <MessageCircle className="h-4 w-4 fill-kohlrabi text-kohlrabi" aria-label="Your turn" />
            <div className="mt-2 divide-y divide-pebble">
              {yours.map((t) => {
                const p = profileById(t.profileId)
                if (!p) return null
                return <Row key={t.id} threadId={t.id} />
              })}
            </div>
          </section>
        )}
        {theirs.length > 0 && (
          <section className={cn(yours.length > 0 && 'mt-6')}>
            <MessageCircle className="h-4 w-4 text-stone" aria-label="Their turn" />
            <div className="mt-2 divide-y divide-pebble">
              {theirs.map((t) => (
                <Row key={t.id} threadId={t.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Row({ threadId }: { threadId: string }) {
  const thread = useAppStore((s) => s.threads.find((t) => t.id === threadId))
  const profile = useAppStore((s) => (thread ? s.profileById(thread.profileId) : undefined))
  const session = useAppStore((s) =>
    thread?.gameSessionId ? s.sessions[thread.gameSessionId] : undefined,
  )
  const reviewed = useAppStore((s) => Boolean(s.dateReviews[threadId]))
  const typing = useAppStore((s) => Boolean(s.typingByThread[threadId]))
  if (!thread || !profile) return null
  const last = thread.messages[thread.messages.length - 1]
  const lastText = last?.text
  const theirs = Boolean(lastText && last.fromId !== 'you')
  const ready = thread.profileId === 'maya' && !reviewed
  const liveGame = session && session.status !== 'complete'
  const face = profile.photos[0]

  return (
    <div className="flex items-center gap-3 py-3">
      <Link to={`/matches/${thread.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        {face ? (
          <GrainPhoto src={face.url} alt="" className="h-14 w-14 shrink-0 rounded-full" />
        ) : (
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-pebble" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-ui text-[16px] font-semibold">
            {profile.name}, {profile.age}
          </p>
          {typing ? (
            <div className="mt-1.5">
              <TypingDots />
            </div>
          ) : liveGame ? (
            <GameTile gameId={session.gameId} size="sm" className="mt-1 h-8 w-8 rounded-[10px]" />
          ) : lastText ? (
            <p className={cn('truncate', theirs ? 'type-user' : 'type-chrome text-stone')}>
              {lastText}
            </p>
          ) : null}
        </div>
      </Link>
      <Link
        to={`/matches/${thread.id}/review`}
        className="grid h-9 w-9 shrink-0 place-items-center text-kohlrabi"
        aria-label={reviewed ? 'Reviewed' : 'Review'}
      >
        {reviewed ? (
          <ClipboardCheck className="h-5 w-5" strokeWidth={2.2} />
        ) : (
          <ClipboardList className={cn('h-5 w-5', ready && 'text-kohlrabi')} strokeWidth={2.2} />
        )}
      </Link>
    </div>
  )
}
