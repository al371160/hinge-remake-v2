import { ChevronLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProfileStack } from '../components/ProfileStack'
import { useAppStore } from '../store/appStore'
import type { GameId } from '../types'

export function ChatProfile() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const thread = useAppStore((s) => s.threads.find((t) => t.id === threadId))
  const profile = useAppStore((s) => (thread ? s.profileById(thread.profileId) : undefined))
  const queued = useAppStore((s) => s.queuedGame)
  const beginDraftGame = useAppStore((s) => s.beginDraftGame)

  useEffect(() => {
    if (queued?.threadId && queued.threadId === thread?.id) {
      navigate(`/matches/${thread.id}`, { replace: true })
    }
  }, [queued, thread, navigate])

  if (!thread || !profile) return null

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-1 px-2 pt-1 pb-2">
        <Link to={`/matches/${thread.id}`} className="grid h-10 w-10 place-items-center" aria-label="Back">
          <ChevronLeft />
        </Link>
        <p className="type-title">{profile.name}</p>
      </header>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4">
        <ProfileStack
          profile={profile}
          onLikeGame={(gameId) => {
            beginDraftGame({
              profileId: profile.id,
              gameId: gameId as GameId,
              threadId: thread.id,
            })
          }}
        />
      </div>
    </div>
  )
}
