import { X } from 'lucide-react'

export function PassButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Skip"
      onClick={onClick}
      className="absolute bottom-4 left-4 z-20 grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-[0_2px_10px_rgba(26,26,26,0.16)]"
    >
      <X className="h-5 w-5" strokeWidth={2.6} />
    </button>
  )
}
