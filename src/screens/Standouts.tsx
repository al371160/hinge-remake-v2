import { Flower2 } from 'lucide-react'
import { LikeSheet } from '../components/LikeSheet'
import { PassButton } from '../components/PassButton'
import { ProfileStack } from '../components/ProfileStack'
import { useAppStore } from '../store/appStore'
import type { GameId } from '../types'

export function Standouts() {
  const id = useAppStore((s) => s.standoutIds[0])
  const remaining = useAppStore((s) => s.standoutIds.length)
  const profile = useAppStore((s) => (id ? s.profileById(id) : undefined))
  const skip = useAppStore((s) => s.skipStandout)
  const openSheet = useAppStore((s) => s.openSheet)
  const beginDraftGame = useAppStore((s) => s.beginDraftGame)

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <header className="flex items-center justify-between px-5 pt-2 pb-3">
        <h1 className="type-title">Standouts</h1>
        <span className="flex items-center gap-1.5">
          <Flower2 className="h-5 w-5 text-coral" strokeWidth={2.2} />
          <span className="type-chrome font-semibold">{remaining}</span>
        </span>
      </header>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4">
        {profile ? (
          <ProfileStack
            key={profile.id}
            roseOnly
            profile={profile}
            onLikePhoto={(targetId) =>
              openSheet({ profileId: profile.id, targetType: 'photo', targetId, roseOnly: true })
            }
            onLikePrompt={(targetId) =>
              openSheet({ profileId: profile.id, targetType: 'prompt', targetId, roseOnly: true })
            }
            onLikeVoice={() =>
              openSheet({
                profileId: profile.id,
                targetType: 'voice',
                targetId: profile.voicePrompt?.id ?? 'voice',
                roseOnly: true,
              })
            }
            onLikeVideo={() =>
              openSheet({
                profileId: profile.id,
                targetType: 'video',
                targetId: profile.videoPrompt?.id ?? 'video',
                roseOnly: true,
              })
            }
            onLikePoll={(option) =>
              openSheet({
                profileId: profile.id,
                targetType: 'poll',
                targetId: option,
                roseOnly: true,
              })
            }
            onLikeGame={(gameId) =>
              beginDraftGame({
                profileId: profile.id,
                gameId: gameId as GameId,
                roseOnly: true,
              })
            }
          />
        ) : (
          <div className="flex h-[70%] flex-col items-center justify-center px-8 text-center">
            <p className="type-title">That's all</p>
          </div>
        )}
      </div>
      {profile && <PassButton onClick={skip} />}
      <LikeSheet />
    </div>
  )
}
