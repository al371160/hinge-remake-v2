import { FilterBar } from '../components/FilterBar'
import { LikeSheet } from '../components/LikeSheet'
import { PassButton } from '../components/PassButton'
import { ProfileStack } from '../components/ProfileStack'
import { matchesPreferences } from '../lib/filters'
import { useAppStore } from '../store/appStore'
import type { GameId } from '../types'

export function Discover() {
  const discoverIds = useAppStore((s) => s.discoverIds)
  const prefs = useAppStore((s) => s.preferences)
  const profileById = useAppStore((s) => s.profileById)
  const skip = useAppStore((s) => s.skip)
  const undoSkip = useAppStore((s) => s.undoSkip)
  const canUndo = useAppStore((s) => s.skipped.length > 0)
  const openSheet = useAppStore((s) => s.openSheet)
  const beginDraftGame = useAppStore((s) => s.beginDraftGame)

  const profile = discoverIds
    .map((id) => profileById(id))
    .find((p) => p && matchesPreferences(p, prefs))

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <FilterBar />

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4">
        {profile ? (
          <ProfileStack
            key={profile.id}
            profile={profile}
            onUndo={undoSkip}
            canUndo={canUndo}
            onLikePhoto={(targetId) =>
              openSheet({ profileId: profile.id, targetType: 'photo', targetId })
            }
            onLikePrompt={(targetId) =>
              openSheet({ profileId: profile.id, targetType: 'prompt', targetId })
            }
            onLikeVoice={() =>
              openSheet({
                profileId: profile.id,
                targetType: 'voice',
                targetId: profile.voicePrompt?.id ?? 'voice',
              })
            }
            onLikeVideo={() =>
              openSheet({
                profileId: profile.id,
                targetType: 'video',
                targetId: profile.videoPrompt?.id ?? 'video',
              })
            }
            onLikePoll={(option) =>
              openSheet({
                profileId: profile.id,
                targetType: 'poll',
                targetId: option,
              })
            }
            onLikeGame={(gameId) =>
              beginDraftGame({
                profileId: profile.id,
                gameId: gameId as GameId,
              })
            }
          />
        ) : (
          <EmptyDiscover />
        )}
      </div>
      {profile && <PassButton onClick={skip} />}
      <LikeSheet />
    </div>
  )
}

function EmptyDiscover() {
  return (
    <div className="flex h-[70%] flex-col items-center justify-center px-8 text-center">
      <p className="type-title">Caught up</p>
    </div>
  )
}
