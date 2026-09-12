import { cn } from '../lib/cn'

export function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[5px]', className)} aria-label="Typing">
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.14}s` }} />
      ))}
    </span>
  )
}
