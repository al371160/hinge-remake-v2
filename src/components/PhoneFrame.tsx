import type { ReactNode } from 'react'
import { IosStatusIcons } from './IosStatusIcons'

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#241f1b] p-4 max-[520px]:p-0">
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[40px] bg-canvas shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-black/30 max-[520px]:h-dvh max-[520px]:w-full max-[520px]:rounded-none max-[520px]:shadow-none max-[520px]:ring-0">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-11 items-end justify-between px-7 pb-[3px] font-ui text-[15px] font-semibold tracking-[-0.02em] text-ink max-[520px]:pt-[env(safe-area-inset-top)]">
          <span>9:41</span>
          <IosStatusIcons />
        </div>
        {children}
      </div>
    </div>
  )
}
