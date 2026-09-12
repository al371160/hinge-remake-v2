import { BadgeCheck } from 'lucide-react'
import { cn } from '../lib/cn'

export function VerifiedBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        'type-chrome inline-flex items-center gap-0.5 font-semibold text-kohlrabi',
      )}
    >
      <BadgeCheck className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'fill-kohlrabi text-paper')} />
      Verified
    </span>
  )
}
