import { cn } from '../lib/cn'

interface Props {
  src: string
  alt: string
  className?: string
}

export function GrainPhoto({ src, alt, className }: Props) {
  return (
    <div className={cn('relative overflow-hidden bg-pebble', className)}>
      <img src={src} alt={alt} className="grain-img h-full w-full object-cover" />
      <div className="grain-overlay" />
    </div>
  )
}
