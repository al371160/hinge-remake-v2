import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { GameQueueCard } from './GameQueueCard'

export function GameSendSheet() {
  const queued = useAppStore((s) => s.queuedGame)
  const sendQueuedGame = useAppStore((s) => s.sendQueuedGame)
  const clearQueuedGame = useAppStore((s) => s.clearQueuedGame)
  const reduceMotion = useReducedMotion()
  const [comment, setComment] = useState('')
  const open = Boolean(queued && !queued.threadId)

  return (
    <AnimatePresence>
      {open && queued && (
        <motion.div
          className="absolute inset-0 z-40 flex flex-col justify-end bg-[#efeae2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-14 pb-3">
            <GameQueueCard queued={queued} onDismiss={clearQueuedGame} />
          </div>
          <form
            className="flex items-end gap-2 bg-canvas px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault()
              sendQueuedGame(comment)
              setComment('')
            }}
          >
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or send"
              className="type-user h-11 min-w-0 flex-1 rounded-full bg-[#e5e5ea] px-4 outline-none placeholder:font-ui placeholder:text-[13px] placeholder:text-stone/50"
            />
            <motion.button
              type="submit"
              aria-label="Send"
              whileTap={reduceMotion ? undefined : { scale: 0.86 }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1fa1f1] type-chrome font-bold text-white"
            >
              ↑
            </motion.button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
