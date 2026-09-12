import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Flower2, Swords } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameTile } from '../components/GameTile'
import { GrainPhoto } from '../components/GrainPhoto'
import { describeLike, isGameInvite } from '../lib/likeTarget'
import { useAppStore } from '../store/appStore'
import type { Like, Profile } from '../types'

function likeRank(like: Like) {
  if (isGameInvite(like)) return 0
  if (like.kind === 'rose') return 1
  return 2
}

const SWIPE = 120

export function LikesYou() {
  const incomingLikes = useAppStore((s) => s.incomingLikes)
  const you = useAppStore((s) => s.currentUser)
  const profileById = useAppStore((s) => s.profileById)
  const skipIncoming = useAppStore((s) => s.skipIncoming)
  const matchIncoming = useAppStore((s) => s.matchIncoming)
  const navigate = useNavigate()
  const exitX = useRef(0)

  const ranked = useMemo(
    () =>
      [...incomingLikes]
        .filter((like) => profileById(like.fromId))
        .sort((a, b) => likeRank(a) - likeRank(b)),
    [incomingLikes, profileById],
  )

  const top = ranked[0]
  const peek = ranked.slice(1, 3)
  const sender = top ? profileById(top.fromId) : undefined

  const match = (like: Like) => {
    const threadId = matchIncoming(like.id, isGameInvite(like))
    if (threadId) navigate(`/matches/${threadId}`)
  }

  if (!top || !sender) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-canvas">
        <header className="px-5 pt-2 pb-3">
          <h1 className="type-title">Likes You</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="type-title">Caught up</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <header className="px-5 pt-2 pb-3">
        <h1 className="type-title">Likes You</h1>
      </header>

      <div className="relative isolate min-h-0 flex-1 overflow-hidden px-4 pb-6">
        {peek.map((_, i) => (
          <div
            key={`peek-${i}`}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-44 rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.08)]"
            style={{
              transform: `translateY(${(i + 1) * 10}px) scale(${1 - (i + 1) * 0.04})`,
              zIndex: i,
              transformOrigin: 'top center',
            }}
          />
        ))}

        <AnimatePresence initial={false}>
          <motion.div
            key={top.id}
            className="relative z-10 cursor-grab active:cursor-grabbing"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ x: exitX.current, opacity: 0, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.86}
            onDragEnd={(_, info: PanInfo) => {
              if (info.offset.x > SWIPE || info.velocity.x > 650) {
                exitX.current = 320
                match(top)
              } else if (info.offset.x < -SWIPE || info.velocity.x < -650) {
                exitX.current = -320
                skipIncoming(top.id)
              }
            }}
          >
            <LikeCard like={top} sender={sender} you={you} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LikeCard({ like, sender, you }: { like: Like; sender: Profile; you: Profile }) {
  const info = describeLike(you, like)
  const face = sender.photos[0]

  return (
    <article className="overflow-hidden rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.08)]">
      <div className="relative">
        {info.kind === 'photo' && info.photo && (
          <GrainPhoto src={info.photo.url} alt={info.photo.alt} className="aspect-[4/5] max-h-[360px] w-full" />
        )}
        {info.kind === 'video' && info.video && (
          <GrainPhoto src={info.video.poster} alt="" className="aspect-[4/5] max-h-[360px] w-full" />
        )}
        {info.kind === 'prompt' && info.prompt && (
          <div className="px-6 pt-8 pb-6">
            <p className="type-user">{info.prompt.answer}</p>
          </div>
        )}
        {info.kind === 'game' && (
          <div className="flex items-center gap-4 px-5 pt-6 pb-4">
            <GameTile gameId={info.gameId} className="shrink-0" />
            {info.quote && <p className="type-user min-w-0">“{info.quote}”</p>}
          </div>
        )}
        {info.kind === 'voice' && info.voice && (
          <div className="px-6 pt-8 pb-6">
            <p className="type-user">“{info.voice.spoken}”</p>
          </div>
        )}
        {info.kind === 'poll' && (
          <div className="px-6 pt-8 pb-6">
            <p className="type-user">{info.option}</p>
          </div>
        )}

        {(like.kind === 'rose' || isGameInvite(like)) && (
          <span className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(26,26,26,0.08)]">
            {like.kind === 'rose' ? (
              <Flower2 className="h-4 w-4 text-coral" strokeWidth={2.2} />
            ) : (
              <Swords className="h-4 w-4 text-kohlrabi" strokeWidth={2.2} />
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        {face && <GrainPhoto src={face.url} alt="" className="h-12 w-12 shrink-0 rounded-full" />}
        <p className="min-w-0 truncate font-ui text-[16px] font-semibold">
          {sender.name}, {sender.age}
        </p>
      </div>

      {like.comment && <p className="type-user mx-5 mb-5">{like.comment}</p>}
    </article>
  )
}
