import { useEffect, useRef, useState } from 'react'
import type { CupPongPayload } from '../types'
import { cupPositions } from './engine'

interface Props {
  payload: CupPongPayload
  disabled?: boolean
  onShot: (cupIndex: number | null) => void
}

export function CupPong({ payload, disabled, onShot }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null)
  const flying = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#e8d8c8'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c4a992'
    ctx.fillRect(0, h * 0.72, w, h * 0.28)

    const cups = cupPositions(w, h)
    cups.forEach((c, i) => {
      if (!payload.cups[i]) return
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
      ctx.fillStyle = '#c23b2e'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(c.x, c.y - 2, c.r * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = '#f4efe8'
      ctx.fill()
    })

    const start = { x: w / 2, y: h - 36 }
    ctx.beginPath()
    ctx.arc(start.x, start.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#fff8f0'
    ctx.fill()
    ctx.strokeStyle = '#1a1a1a'
    ctx.stroke()

    if (aim) {
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(start.x + (start.x - aim.x) * 1.4, start.y + (start.y - aim.y) * 1.4)
      ctx.strokeStyle = '#1a1a1a'
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [payload.cups, aim])

  const shoot = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas || flying.current || disabled) return
    const w = canvas.width
    const h = canvas.height
    const start = { x: w / 2, y: h - 36 }
    const vx = (start.x - to.x) * 0.18
    const vy = (start.y - to.y) * 0.18
    flying.current = true
    let x = start.x
    let y = start.y
    let velX = vx
    let velY = vy
    const cups = cupPositions(w, h)
    const ctx = canvas.getContext('2d')!

    const tick = () => {
      velY += 0.55
      x += velX
      y += velY
      ctx.fillStyle = '#e8d8c8'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#c4a992'
      ctx.fillRect(0, h * 0.72, w, h * 0.28)
      cups.forEach((c, i) => {
        if (!payload.cups[i]) return
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.fillStyle = '#c23b2e'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(c.x, c.y - 2, c.r * 0.55, 0, Math.PI * 2)
        ctx.fillStyle = '#f4efe8'
        ctx.fill()
      })
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#fff8f0'
      ctx.fill()

      const hit = cups.findIndex((c, i) => {
        if (!payload.cups[i]) return false
        const dx = x - c.x
        const dy = y - c.y
        return Math.hypot(dx, dy) < c.r * 0.85 && velY > 0
      })

      if (hit >= 0 || y > h + 20 || x < -20 || x > w + 20) {
        flying.current = false
        onShot(hit >= 0 ? hit : null)
        return
      }
      requestAnimationFrame(tick)
    }
    void from
    requestAnimationFrame(tick)
  }

  return (
    <div className="flex h-full flex-col bg-[#e8d8c8] px-6 pt-3 pb-6">
      <p className="type-chrome font-semibold">
        {payload.winner === 1
          ? 'You win'
          : payload.winner === 2
            ? 'They win'
            : `${payload.shotsLeft} left`}
      </p>
      <div className="mt-4 flex flex-1 items-center">
      <canvas
        ref={canvasRef}
        width={330}
        height={420}
        className="w-full touch-none rounded-[22px] shadow-[0_8px_20px_rgba(80,50,20,0.12)]"
        onPointerDown={(e) => {
          if (disabled || flying.current) return
          const r = e.currentTarget.getBoundingClientRect()
          setAim({
            x: ((e.clientX - r.left) / r.width) * 330,
            y: ((e.clientY - r.top) / r.height) * 420,
          })
        }}
        onPointerMove={(e) => {
          if (!aim) return
          const r = e.currentTarget.getBoundingClientRect()
          setAim({
            x: ((e.clientX - r.left) / r.width) * 330,
            y: ((e.clientY - r.top) / r.height) * 420,
          })
        }}
        onPointerUp={(e) => {
          if (!aim) return
          const r = e.currentTarget.getBoundingClientRect()
          const to = {
            x: ((e.clientX - r.left) / r.width) * 330,
            y: ((e.clientY - r.top) / r.height) * 420,
          }
          setAim(null)
          shoot(aim, to)
        }}
      />
      </div>
    </div>
  )
}
