import { Flower2, Swords } from 'lucide-react'
import { describeLike, isGameInvite } from '../lib/likeTarget'
import { useAppStore } from '../store/appStore'
import type { Like, Profile } from '../types'
import { GameTile } from './GameTile'
import { GrainPhoto } from './GrainPhoto'

export function ChatPin({ like, profile }: { like: Like; profile: Profile }) {
  const you = useAppStore((s) => s.currentUser)
  const contentOwner = like.toId === 'you' ? you : profile
  const info = describeLike(contentOwner, like)

  return (
    <div className="mx-4 mt-2 overflow-hidden rounded-2xl bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      {info.kind === 'photo' && info.photo && (
        <GrainPhoto src={info.photo.url} alt="" className="h-24 w-full" />
      )}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {info.kind === 'game' && <GameTile gameId={info.gameId} size="sm" />}
        <div className="min-w-0 flex-1">
          {info.quote && <p className="type-user">“{info.quote}”</p>}
        </div>
        {like.kind === 'rose' ? (
          <Flower2 className="h-4 w-4 shrink-0 text-coral" strokeWidth={2.2} />
        ) : isGameInvite(like) ? (
          <Swords className="h-4 w-4 shrink-0 text-kohlrabi" strokeWidth={2.2} />
        ) : null}
      </div>
    </div>
  )
}
