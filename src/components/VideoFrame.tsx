import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'

interface Props {
  src: string
  poster: string
  alt: string
  className?: string
}

export function VideoFrame({ src, poster, alt, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      void el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <div className={`relative overflow-hidden bg-pebble ${className ?? ''}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        playsInline
        loop
        muted
        className="h-full w-full object-cover"
        aria-label={alt}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause video' : 'Play video'}
        className="absolute inset-0 grid place-items-center"
      >
        {!playing && (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-paper shadow-[0_4px_14px_rgba(26,26,26,0.28)]">
            <Play className="ml-0.5 h-6 w-6 fill-paper" />
          </span>
        )}
        {playing && (
          <span className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-ink/80 text-paper">
            <Pause className="h-4 w-4 fill-paper" />
          </span>
        )}
      </button>
    </div>
  )
}
