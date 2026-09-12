import type { Prompt } from '../types'
import { HeartButton } from './HeartButton'

interface Props {
  prompt: Prompt
  onLike?: () => void
}

export function PromptCard({ prompt, onLike }: Props) {
  return (
    <article className="relative rounded-[24px] bg-paper px-6 pt-6 pb-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      <p className="type-chrome text-stone">{prompt.question}</p>
      <p className="type-user mt-3">{prompt.answer}</p>
      {onLike && <HeartButton onClick={onLike} className="mt-5 ml-auto" />}
    </article>
  )
}
