import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { describeLike } from '../lib/likeTarget'
import { useAppStore } from '../store/appStore'
import { CapsuleButton } from './CapsuleButton'
import { GameTile } from './GameTile'
import { GrainPhoto } from './GrainPhoto'

function categoryWord(type: string) {
  if (type === 'photo') return 'Photo'
  if (type === 'video') return 'Video'
  if (type === 'voice') return 'Voice'
  if (type === 'game') return 'Game'
  if (type === 'poll') return 'Poll'
  return ''
}

export function LikeSheet() {
  const sheet = useAppStore((s) => s.sheet)
  const closeSheet = useAppStore((s) => s.closeSheet)
  const sendLike = useAppStore((s) => s.sendLike)
  const roses = useAppStore((s) => s.roses)
  const profile = useAppStore((s) => (sheet ? s.profileById(sheet.profileId) : undefined))
  const [comment, setComment] = useState('')

  useEffect(() => {
    setComment('')
  }, [sheet])

  const isGame = sheet?.targetType === 'game'
  const roseOnly = Boolean(sheet?.roseOnly)
  const canChallenge = Boolean(profile?.acceptChallenges)
  const info = sheet && profile ? describeLike(profile, sheet) : null
  const header = roseOnly ? 'Rose' : sheet ? categoryWord(sheet.targetType) : ''

  return (
    <AnimatePresence>
      {sheet && profile && info && (
        <motion.div
          className="absolute inset-0 z-40 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={closeSheet} />
          <motion.div
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            transition={{ duration: 0.22 }}
            className="relative rounded-t-[24px] bg-canvas px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sand" />
            {header && <p className="type-chrome font-medium text-stone">{header}</p>}

            <div className="mt-3 overflow-hidden rounded-2xl bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
              {info.kind === 'photo' && info.photo && (
                <GrainPhoto src={info.photo.url} alt={info.photo.alt} className="h-28 w-full" />
              )}
              {info.kind === 'video' && info.video && (
                <GrainPhoto src={info.video.poster} alt="" className="h-28 w-full" />
              )}
              {info.kind === 'prompt' && info.prompt && (
                <div className="px-4 py-3">
                  <p className="type-user">{info.prompt.answer}</p>
                </div>
              )}
              {info.kind === 'poll' && (
                <div className="px-4 py-3">
                  <p className="type-user">{info.option}</p>
                </div>
              )}
              {info.kind === 'voice' && info.voice && (
                <div className="px-4 py-3">
                  <p className="type-user">“{info.voice.spoken}”</p>
                </div>
              )}
              {info.kind === 'game' && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <GameTile gameId={info.gameId} size="sm" />
                  {info.quote && <p className="type-user">“{info.quote}”</p>}
                </div>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              rows={3}
              className="type-user mt-4 w-full resize-none rounded-2xl bg-pebble px-4 py-3 text-ink outline-none placeholder:font-ui placeholder:text-[13px] placeholder:text-stone/70"
            />

            <div className="mt-4 flex flex-col gap-2">
              {roseOnly ? (
                <CapsuleButton
                  onClick={() => sendLike({ comment, kind: isGame ? 'challenge' : 'rose' })}
                  disabled={roses < 1}
                >
                  Rose
                </CapsuleButton>
              ) : isGame ? (
                <>
                  {canChallenge && (
                    <CapsuleButton onClick={() => sendLike({ comment, kind: 'challenge' })}>
                      Invite
                    </CapsuleButton>
                  )}
                  <CapsuleButton variant="soft" onClick={() => sendLike({ comment, kind: 'like' })}>
                    Like
                  </CapsuleButton>
                  <CapsuleButton
                    variant="rose"
                    disabled={roses < 1}
                    onClick={() => sendLike({ comment, kind: 'rose' })}
                  >
                    Rose
                  </CapsuleButton>
                </>
              ) : (
                <>
                  <CapsuleButton onClick={() => sendLike({ comment, kind: 'like' })}>
                    Like
                  </CapsuleButton>
                  <CapsuleButton
                    variant="rose"
                    disabled={roses < 1}
                    onClick={() => sendLike({ comment, kind: 'rose' })}
                  >
                    Rose
                  </CapsuleButton>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
