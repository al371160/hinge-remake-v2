import { gameMeta, isGameId } from '../data/games'
import type { Like, Profile } from '../types'

export function isGameInvite(like: Pick<Like, 'kind' | 'targetType' | 'gameId'>) {
  return like.kind === 'challenge' || like.targetType === 'game' || isGameId(like.gameId)
}

export function describeLike(
  profile: Profile,
  like: Pick<Like, 'targetType' | 'targetId' | 'gameId'>,
) {
  if (like.targetType === 'photo') {
    const photos = profile.photos ?? []
    const photo = photos.find((p) => p.id === like.targetId) ?? photos[0]
    return {
      kind: 'photo' as const,
      photo,
      label: photo?.kind === 'video' ? 'Video' : 'Photo',
      quote: null,
    }
  }
  if (like.targetType === 'prompt') {
    const prompts = profile.prompts ?? []
    const prompt = prompts.find((p) => p.id === like.targetId) ?? prompts[0]
    return {
      kind: 'prompt' as const,
      prompt,
      label: '',
      quote: prompt?.answer ?? '',
    }
  }
  if (like.targetType === 'voice') {
    return {
      kind: 'voice' as const,
      voice: profile.voicePrompt,
      label: 'Voice',
      quote: profile.voicePrompt?.spoken ?? profile.voicePrompt?.question ?? '',
    }
  }
  if (like.targetType === 'video') {
    return {
      kind: 'video' as const,
      video: profile.videoPrompt,
      label: 'Video',
      quote: profile.videoPrompt?.caption ?? profile.videoPrompt?.question ?? '',
    }
  }
  if (like.targetType === 'poll') {
    return {
      kind: 'poll' as const,
      poll: profile.poll,
      option: like.targetId,
      label: 'Poll',
      quote: like.targetId,
    }
  }
  const gameId = isGameId(like.gameId) ? like.gameId : 'eightBall'
  const pref = (profile.games ?? []).find((g) => g.gameId === gameId)
  const meta = gameMeta(gameId)
  return {
    kind: 'game' as const,
    gameId,
    label: 'Game',
    quote: pref?.oneLiner ?? meta.blurb,
  }
}
