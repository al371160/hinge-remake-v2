import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const setToast = useAppStore((s) => s.setToast)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast, setToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="type-chrome pointer-events-none absolute inset-x-6 bottom-24 z-50 rounded-full bg-ink px-4 py-2.5 text-center font-medium text-paper"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
