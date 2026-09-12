import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'rose' | 'soft'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function CapsuleButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className,
  type = 'button',
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'type-chrome inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-8 font-bold tracking-tight transition-transform active:scale-[0.97] disabled:opacity-40',
        variant === 'primary' && 'bg-ink text-paper',
        variant === 'ghost' && 'bg-transparent text-stone',
        variant === 'rose' && 'bg-coral text-paper',
        variant === 'soft' && 'bg-pebble text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}
