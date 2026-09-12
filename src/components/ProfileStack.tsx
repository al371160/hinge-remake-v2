import type { Profile } from '../types'
import { GamesCard } from './GamesCard'
import { GrainPhoto } from './GrainPhoto'
import { HeartButton } from './HeartButton'
import { PhotoCard } from './PhotoCard'
import { ProfileIdentity } from './ProfileIdentity'
import { PromptCard } from './PromptCard'
import { PromptPollCard } from './PromptPollCard'
import { VideoFrame } from './VideoFrame'
import { VideoPromptCard } from './VideoPromptCard'
import { VitalsRow } from './VitalsRow'
import { VoicePromptCard } from './VoicePromptCard'

interface Props {
  profile: Profile
  onLikePhoto?: (photoId: string) => void
  onLikePrompt?: (promptId: string) => void
  onLikeGame?: (gameId: string) => void
  onLikeVoice?: () => void
  onLikeVideo?: () => void
  onLikePoll?: (option: string) => void
  onEmptyGames?: () => void
  onUndo?: () => void
  canUndo?: boolean
  roseOnly?: boolean
}

export function ProfileStack({
  profile,
  onLikePhoto,
  onLikePrompt,
  onLikeGame,
  onLikeVoice,
  onLikeVideo,
  onLikePoll,
  onEmptyGames,
  onUndo,
  canUndo,
  roseOnly,
}: Props) {
  const [hero, ...rest] = profile.photos
  const [p1, p2, p3] = profile.prompts
  const heroVideo = hero?.kind === 'video' && hero.videoUrl

  return (
    <div className="flex flex-col gap-4 pb-24">
      <ProfileIdentity profile={profile} onUndo={onUndo} canUndo={canUndo} />

      <article className="relative overflow-hidden rounded-[24px] bg-paper">
        {heroVideo ? (
          <VideoFrame
            src={hero.videoUrl!}
            poster={hero.url}
            alt={hero.alt}
            className="aspect-[4/5] w-full"
          />
        ) : hero ? (
          <GrainPhoto src={hero.url} alt={hero.alt} className="aspect-[4/5] w-full" />
        ) : (
          <div className="type-chrome grid aspect-[4/5] place-items-center bg-pebble text-stone">
            Photo
          </div>
        )}
        {hero && onLikePhoto && (
          <HeartButton
            onClick={() => onLikePhoto(hero.id)}
            className="absolute right-3 bottom-3"
            label={roseOnly ? 'Send a rose' : 'Like this photo'}
          />
        )}
      </article>

      {profile.poll && <PromptPollCard poll={profile.poll} onLike={onLikePoll} />}

      <GamesCard
        games={profile.games}
        onLikeCard={
          onLikeGame
            ? () => {
                const fav = profile.games.find((g) => g.favorite) ?? profile.games[0]
                if (fav) onLikeGame(fav.gameId)
              }
            : undefined
        }
        onLikeGame={onLikeGame ? (g) => onLikeGame(g.gameId) : undefined}
        onEmptyAction={onEmptyGames}
      />

      {profile.voicePrompt && (
        <VoicePromptCard prompt={profile.voicePrompt} onLike={onLikeVoice} />
      )}

      {p1 && <PromptCard prompt={p1} onLike={onLikePrompt ? () => onLikePrompt(p1.id) : undefined} />}

      {rest[0] && (
        <PhotoCard
          photo={rest[0]}
          onLike={onLikePhoto ? () => onLikePhoto(rest[0]!.id) : undefined}
        />
      )}

      {profile.videoPrompt && (
        <VideoPromptCard prompt={profile.videoPrompt} onLike={onLikeVideo} />
      )}

      {p2 && <PromptCard prompt={p2} onLike={onLikePrompt ? () => onLikePrompt(p2.id) : undefined} />}
      <VitalsRow vitals={profile.vitals} />
      {rest[1] && (
        <PhotoCard
          photo={rest[1]}
          onLike={onLikePhoto ? () => onLikePhoto(rest[1]!.id) : undefined}
        />
      )}
      {p3 && <PromptCard prompt={p3} onLike={onLikePrompt ? () => onLikePrompt(p3.id) : undefined} />}
      {rest.slice(2).map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onLike={onLikePhoto ? () => onLikePhoto(photo.id) : undefined}
        />
      ))}
    </div>
  )
}
