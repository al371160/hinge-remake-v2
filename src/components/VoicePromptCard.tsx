import { Pause, Play } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { VoicePrompt } from '../types'
import { HeartButton } from './HeartButton'

interface Props {
  prompt: VoicePrompt
  onLike?: () => void
}

export function VoicePromptCard({ prompt, onLike }: Props) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const started = useRef(0)

  useEffect(() => {
    if (!playing) return
    started.current = performance.now() - progress * prompt.durationSec * 1000
    let frame = 0
    const tick = () => {
      const t = (performance.now() - started.current) / 1000
      if (t >= prompt.durationSec) {
        setProgress(1)
        setPlaying(false)
        window.speechSynthesis?.cancel()
        return
      }
      setProgress(t / prompt.durationSec)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, prompt.durationSec])

  const toggle = () => {
    if (playing) {
      window.speechSynthesis?.cancel()
      setPlaying(false)
      return
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(prompt.spoken)
      utter.rate = 0.95
      window.speechSynthesis.speak(utter)
    }
    setPlaying(true)
  }

  const bars = [8, 16, 11, 20, 14, 9, 18, 12, 22, 10, 15, 19, 8, 17, 13]
  const elapsed = Math.min(prompt.durationSec, Math.round(progress * prompt.durationSec))

  return (
    <article className="relative rounded-[24px] bg-paper px-5 py-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      <p className="type-chrome font-semibold tracking-[0.14em] text-stone uppercase">Voice</p>
      <p className="type-user mt-3">“{prompt.spoken}”</p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={toggle}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-paper"
        >
          {playing ? <Pause className="h-5 w-5 fill-paper" /> : <Play className="ml-0.5 h-5 w-5 fill-paper" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex h-8 items-end gap-0.5">
            {bars.map((h, i) => {
              const on = i / bars.length <= progress
              return (
                <span
                  key={i}
                  className={on ? 'w-1.5 rounded-full bg-ink' : 'w-1.5 rounded-full bg-pebble'}
                  style={{ height: `${h * 1.4}px` }}
                />
              )
            })}
          </div>
          <p className="type-chrome mt-1 text-stone">
            0:{String(elapsed).padStart(2, '0')} / 0:{String(prompt.durationSec).padStart(2, '0')}
          </p>
        </div>
        {onLike && <HeartButton onClick={onLike} label="Like this voice" />}
      </div>
    </article>
  )
}
