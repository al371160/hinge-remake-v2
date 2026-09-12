import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProfileStack } from '../components/ProfileStack'
import { useAppStore } from '../store/appStore'
import type { GameId } from '../types'

export function ChatProfile() {
  const { threadId } = useParams()
  const thread = useAppStore((s) => s.threads.find((t) => t.id === threadId))
  const profile = useAppStore((s) => (thread ? s.profileById(thread.profileId) : undefined))
  const startGame = useAppStore((s) => s.startGame)
  const openOverlay = useAppStore((s) => s.openOverlay)

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
            const id = startGame(thread.id, gameId as GameId)
            openOverlay(id)
          }}
        />
      </div>
    </div>
  )
}
