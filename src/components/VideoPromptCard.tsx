import type { VideoPrompt } from '../types'
import { HeartButton } from './HeartButton'
import { VideoFrame } from './VideoFrame'

interface Props {
  prompt: VideoPrompt
  onLike?: () => void
}

export function VideoPromptCard({ prompt, onLike }: Props) {
  return (
    <article className="relative overflow-hidden rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      <VideoFrame
        src={prompt.url}
        poster={prompt.poster}
        alt={prompt.question}
        className="aspect-[4/5] w-full"
      />
      <p className="type-chrome px-5 py-3 font-semibold tracking-[0.14em] text-stone uppercase">
        Video
      </p>
      {onLike && (
        <HeartButton onClick={onLike} className="absolute top-3 right-3" label="Like this video" />
      )}
    </article>
  )
}
