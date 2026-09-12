import { ChevronLeft, ClipboardList, LayoutGrid } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GameBubble } from '../components/GameBubble'
import { GameQueueCard } from '../components/GameQueueCard'
import { GameTile } from '../components/GameTile'
import { TypingDots } from '../components/TypingDots'
import { GAME_IDS, GAME_META } from '../data/games'
import { cn } from '../lib/cn'
import { useAppStore } from '../store/appStore'
import type { GameId, GameSession, Message } from '../types'

export function Chat() {
  const { threadId } = useParams()
  const thread = useAppStore((s) => s.threads.find((t) => t.id === threadId))
  const profile = useAppStore((s) => (thread ? s.profileById(thread.profileId) : undefined))
  const sessions = useAppStore((s) => s.sessions)
  const typing = useAppStore((s) => (threadId ? Boolean(s.typingByThread[threadId]) : false))
  const sendMessage = useAppStore((s) => s.sendMessage)
  const beginDraftGame = useAppStore((s) => s.beginDraftGame)
  const sendQueuedGame = useAppStore((s) => s.sendQueuedGame)
  const clearQueuedGame = useAppStore((s) => s.clearQueuedGame)
  const queued = useAppStore((s) => s.queuedGame)
  const reduceMotion = useReducedMotion()
  const [text, setText] = useState('')
  const [tray, setTray] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const messageCount = thread?.messages.length ?? 0

  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const go = () => {
      el.scrollTop = el.scrollHeight
    }
    go()
    const frame = window.requestAnimationFrame(go)
    return () => window.cancelAnimationFrame(frame)
  }, [messageCount, typing])

  if (!thread || !profile) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas">
        <p className="type-title">Gone</p>
      </div>
    )
  }

  const queuedHere = queued?.threadId === thread.id

  const send = () => {
    if (queuedHere) {
      sendQueuedGame(text)
      setText('')
      return
    }
    sendMessage(thread.id, text)
    setText('')
  }

  const launch = (gameId: GameId) => {
    beginDraftGame({
      gameId,
      profileId: profile.id,
      threadId: thread.id,
    })
    setTray(false)
  }

  const latestGameMsg = [...thread.messages].reverse().find((m) => m.gameSessionId)?.id
  const canSend = Boolean(text.trim()) || queuedHere

  return (
    <div className="flex h-full flex-col bg-[#efeae2]">
      <header className="flex items-center gap-1 bg-canvas px-2 pt-1 pb-2">
        <Link to="/matches" className="grid h-10 w-10 place-items-center" aria-label="Back">
          <ChevronLeft />
        </Link>
        <Link to={`/matches/${thread.id}/profile`} className="min-w-0 flex-1">
          <p className="font-ui text-[16px] font-semibold">{profile.name}</p>
        </Link>
        <Link
          to={`/matches/${thread.id}/review`}
          className="mr-2 grid h-10 w-10 place-items-center text-kohlrabi"
          aria-label="Review"
        >
          <ClipboardList className="h-5 w-5" strokeWidth={2.2} />
        </Link>
      </header>

      <div
        ref={scroller}
        className="scrollbar-hide min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3"
      >
        <AnimatePresence initial={false}>
          {thread.messages.map((m) => (
            <ChatRow
              key={m.id}
              message={m}
              session={m.gameSessionId ? sessions[m.gameSessionId] : undefined}
              name={profile.name}
              latest={m.id === latestGameMsg}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
          {typing && (
            <motion.div
              key="typing"
              className="w-fit"
              initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.92, x: -8 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 460, damping: 32 }}
            >
              <div className="rounded-[18px] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {queuedHere && queued && (
        <div className="px-3 pb-1">
          <GameQueueCard queued={queued} onDismiss={clearQueuedGame} />
        </div>
      )}

      {tray && (
        <div className="grid grid-cols-4 gap-3 border-t border-black/6 bg-canvas px-4 py-3">
          {GAME_IDS.map((id) => (
            <button key={id} type="button" onClick={() => launch(id)} className="text-center">
              <GameTile gameId={id} />
              <p className="type-chrome mt-1.5 truncate font-semibold">{GAME_META[id].short}</p>
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2 bg-canvas px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <button
          type="button"
          onClick={() => setTray((v) => !v)}
          aria-label="Games"
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-full',
            tray ? 'bg-kohlrabi text-paper' : 'bg-[#e5e5ea] text-ink',
          )}
        >
          <LayoutGrid className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={queuedHere ? 'Add a comment or send' : 'Message'}
          className="type-user h-11 min-w-0 flex-1 rounded-full bg-[#e5e5ea] px-4 outline-none placeholder:font-ui placeholder:text-[13px] placeholder:text-stone/50"
        />
        <div className="relative grid h-9 w-9 shrink-0 place-items-center">
          <AnimatePresence>
            {canSend && (
              <motion.button
                key="send"
                type="submit"
                aria-label="Send"
                initial={reduceMotion ? false : { scale: 0.55, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
                whileTap={reduceMotion ? undefined : { scale: 0.86 }}
                transition={{ type: 'spring', stiffness: 560, damping: 22 }}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#1fa1f1] type-chrome font-bold text-white"
              >
                ↑
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  )
}

function ChatRow({
  message,
  session,
  name,
  latest,
  reduceMotion,
}: {
  message: Message
  session?: GameSession
  name: string
  latest: boolean
  reduceMotion: boolean
}) {
  const mine = message.fromId === 'you'
  const enter = reduceMotion
    ? false
    : mine
      ? { opacity: 0.55, y: 36, scale: 0.78, x: 18 }
      : { opacity: 0, y: 12, scale: 0.94, x: -10 }

  if (message.gameSessionId && session) {
    return (
      <motion.div
        className={mine ? 'ml-auto flex justify-end' : ''}
        initial={enter}
        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      >
        <GameBubble
          session={session}
          name={name}
          snapshot={message.gameSnapshot}
          latest={latest}
        />
      </motion.div>
    )
  }

  if (!message.text) return null

  return (
    <motion.div
      className={cn(
        'type-user max-w-[76%] rounded-[18px] px-3.5 py-2',
        mine ? 'ml-auto bg-[#1fa1f1] text-white' : 'bg-white text-ink',
      )}
      initial={enter}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: mine ? 480 : 420, damping: mine ? 26 : 30 }}
    >
      {message.text}
    </motion.div>
  )
}
