import { useEffect, useRef, useState } from 'react'
import type { EightBallPayload } from '../types'
import {
  BALL_COLOR,
  BALL_R,
  POCKETS,
  TABLE_H,
  TABLE_W,
  applyEightShot,
  isStripe,
  maxShotSpeed,
  runShot,
  toPortrait,
} from './poolPhysics'

interface Props {
  payload: EightBallPayload
  turn: 'me' | 'them'
  finished?: boolean
  onShot: (next: EightBallPayload, keepTurn: boolean) => void
}

const OUTER_ASPECT = 0.542

export function EightBall({ payload, turn, finished, onShot }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null)
  const [live, setLive] = useState<EightBallPayload>(() => toPortrait(payload))
  const aimRef = useRef<{ x: number; y: number } | null>(null)
  const busy = useRef(false)
  const rafRef = useRef(0)
  const shotGen = useRef(0)
  const commitRef = useRef<(() => void) | null>(null)
  const onShotRef = useRef(onShot)
  const finishedRef = useRef(finished)
  onShotRef.current = onShot
  finishedRef.current = finished

  useEffect(() => {
    if (!busy.current) setLive(toPortrait(payload))
  }, [payload])

  useEffect(() => {
    drawTable(canvasRef.current, live, aim, turn === 'me' && !finished)
  }, [live, aim, turn, finished])

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const fit = () => {
      const availW = stage.clientWidth
      const availH = stage.clientHeight
      let w = availH * OUTER_ASPECT
      let h = availH
      if (w > availW) {
        w = availW
        h = w / OUTER_ASPECT
      }
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      drawTable(canvas, live, aim, turn === 'me' && !finished)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [live, aim, turn, finished])

  const playFrames = (start: EightBallPayload, vx: number, vy: number, shooter: 1 | 2) => {
    if (busy.current || finishedRef.current || start.winner) return
    busy.current = true
    const gen = ++shotGen.current
    const frames = runShot(start, vx, vy)
    const last = frames[frames.length - 1]
    if (!last) {
      busy.current = false
      return
    }
    const result = applyEightShot(start, last.balls, last.pocketed, shooter)
    const commit = () => {
      if (shotGen.current !== gen) return
      cancelAnimationFrame(rafRef.current)
      setLive(result.payload)
      busy.current = false
      commitRef.current = null
      onShotRef.current(result.payload, result.keepTurn)
    }
    commitRef.current = commit

    let i = 0
    const tick = () => {
      if (shotGen.current !== gen) return
      const frame = frames[i]
      if (!frame) {
        commit()
        return
      }
      setLive({
        ...start,
        balls: frame.balls
          .filter((b) => b.id !== 0)
          .map((b) => ({ id: b.id, x: b.x, y: b.y, pocketed: b.pocketed })),
        cue: (() => {
          const cue = frame.balls.find((b) => b.id === 0)!
          return { x: cue.x, y: cue.y, pocketed: cue.pocketed }
        })(),
      })
      i += 1
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (busy.current) commitRef.current?.()
      shotGen.current += 1
    }
  }, [])

  const toTable = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const box = canvas.getBoundingClientRect()
    if (box.width < 2 || box.height < 2) return null
    const felt = feltBox(canvas.width, canvas.height)
    const scale = canvas.width / box.width
    const px = (clientX - box.left) * scale
    const py = (clientY - box.top) * scale
    return {
      x: ((px - felt.x) / felt.w) * TABLE_W,
      y: ((py - felt.y) / felt.h) * TABLE_H,
    }
  }

  const mine = live.assignment === 0 ? null : live.assignment === 1 ? 'Solids' : 'Stripes'
  const status = finished
    ? live.winner === 1
      ? 'You win'
      : live.winner === 2
        ? 'They win'
        : 'Draw'
    : turn === 'me'
      ? 'Your turn'
      : 'Their turn'

  return (
    <div className="flex h-full min-h-0 flex-col px-3 pt-1 pb-3">
      <div className="flex items-baseline justify-between pb-2 text-white">
        <p className="type-chrome font-semibold">{status}</p>
        {mine && <p className="type-chrome font-semibold text-white/65">{mine}</p>}
      </div>
      <div ref={stageRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="absolute top-1/2 left-1/2 touch-none -translate-x-1/2 -translate-y-1/2"
          onPointerDown={(e) => {
            if (finished || turn !== 'me' || busy.current) return
            e.currentTarget.setPointerCapture(e.pointerId)
            const next = toTable(e.clientX, e.clientY)
            aimRef.current = next
            setAim(next)
          }}
          onPointerMove={(e) => {
            if (!aimRef.current) return
            const next = toTable(e.clientX, e.clientY)
            aimRef.current = next
            setAim(next)
          }}
          onPointerUp={(e) => {
            const start = aimRef.current
            aimRef.current = null
            setAim(null)
            if (!start || turn !== 'me' || busy.current || finished) return
            const end = toTable(e.clientX, e.clientY) ?? start
            const dx = live.cue.x - end.x
            const dy = live.cue.y - end.y
            const len = Math.hypot(dx, dy)
            if (len < 0.04) return
            const power = Math.min(len, 0.55) / 0.55
            const speed = maxShotSpeed() * (0.28 + power * 0.72)
            playFrames(live, (dx / len) * speed, (dy / len) * speed, 1)
          }}
        />
      </div>
    </div>
  )
}

function feltBox(w: number, h: number) {
  const rail = Math.min(w, h) * 0.078
  return { x: rail, y: rail, w: w - rail * 2, h: h - rail * 2, rail }
}

function mapFelt(
  felt: { x: number; y: number; w: number; h: number },
  x: number,
  y: number,
) {
  return {
    x: felt.x + (x / TABLE_W) * felt.w,
    y: felt.y + (y / TABLE_H) * felt.h,
  }
}

function drawTable(
  canvas: HTMLCanvasElement | null,
  payload: EightBallPayload,
  aim: { x: number; y: number } | null,
  showCue: boolean,
) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  if (w < 2 || h < 2) return
  const felt = feltBox(w, h)
  const r = BALL_R * felt.w

  ctx.clearRect(0, 0, w, h)
  drawRails(ctx, w, h, felt)
  drawFelt(ctx, felt)
  drawPockets(ctx, felt, r)
  drawDiamonds(ctx, felt)

  const cuePt = mapFelt(felt, payload.cue.x, payload.cue.y)
  const restAim = { x: payload.cue.x, y: payload.cue.y + 0.22 }
  const stickAim = aim ?? (showCue && !payload.cue.pocketed ? restAim : null)

  if (stickAim && !payload.cue.pocketed) {
    const aimPt = mapFelt(felt, stickAim.x, stickAim.y)
    drawCueStick(ctx, cuePt.x, cuePt.y, r, aimPt.x, aimPt.y, Boolean(aim))
  }

  for (const ball of payload.balls) {
    if (ball.pocketed) continue
    const p = mapFelt(felt, ball.x, ball.y)
    drawBall(ctx, p.x, p.y, r, ball.id)
  }

  if (!payload.cue.pocketed) {
    if (aim) {
      const aimPt = mapFelt(felt, aim.x, aim.y)
      drawAimLine(ctx, cuePt.x, cuePt.y, aimPt.x, aimPt.y, r)
    }
    drawCueBall(ctx, cuePt.x, cuePt.y, r)
  }
}

function drawRails(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  felt: { x: number; y: number; w: number; h: number; rail: number },
) {
  const wood = ctx.createLinearGradient(0, 0, w, h)
  wood.addColorStop(0, '#8a4e22')
  wood.addColorStop(0.45, '#6b3814')
  wood.addColorStop(1, '#4a240c')
  ctx.fillStyle = wood
  roundRect(ctx, 0, 0, w, h, felt.rail * 0.9)
  ctx.fill()

  ctx.strokeStyle = 'rgba(240, 210, 150, 0.28)'
  ctx.lineWidth = Math.max(2, felt.rail * 0.08)
  roundRect(ctx, felt.rail * 0.12, felt.rail * 0.12, w - felt.rail * 0.24, h - felt.rail * 0.24, felt.rail * 0.75)
  ctx.stroke()
}

function drawFelt(ctx: CanvasRenderingContext2D, felt: { x: number; y: number; w: number; h: number }) {
  const cloth = ctx.createLinearGradient(felt.x, felt.y, felt.x, felt.y + felt.h)
  cloth.addColorStop(0, '#2f9a45')
  cloth.addColorStop(0.5, '#268a3c')
  cloth.addColorStop(1, '#1d7332')
  ctx.fillStyle = cloth
  ctx.fillRect(felt.x, felt.y, felt.w, felt.h)
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'
  ctx.lineWidth = Math.max(1, felt.w * 0.006)
  ctx.strokeRect(felt.x, felt.y, felt.w, felt.h)
}

function drawPockets(
  ctx: CanvasRenderingContext2D,
  felt: { x: number; y: number; w: number; h: number },
  r: number,
) {
  ctx.fillStyle = '#0b120c'
  for (const p of POCKETS) {
    const pt = mapFelt(felt, p.x, p.y)
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, r * 1.85, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawDiamonds(ctx: CanvasRenderingContext2D, felt: { x: number; y: number; w: number; h: number; rail: number }) {
  const marks = [
    ...[0.25, 0.5, 0.75].flatMap((t) => [
      { x: felt.x + felt.w * t, y: felt.y - felt.rail * 0.42 },
      { x: felt.x + felt.w * t, y: felt.y + felt.h + felt.rail * 0.42 },
    ]),
    ...[0.25, 0.5, 0.75].flatMap((t) => [
      { x: felt.x - felt.rail * 0.42, y: felt.y + felt.h * t },
      { x: felt.x + felt.w + felt.rail * 0.42, y: felt.y + felt.h * t },
    ]),
  ]
  ctx.fillStyle = '#f0d9a8'
  for (const m of marks) {
    ctx.beginPath()
    ctx.arc(m.x, m.y, Math.max(2, felt.rail * 0.08), 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCueStick(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  aimX: number,
  aimY: number,
  pulling: boolean,
) {
  const dx = cx - aimX
  const dy = cy - aimY
  const pullLen = Math.hypot(dx, dy) || 1
  const ux = dx / pullLen
  const uy = dy / pullLen
  const pull = pulling ? Math.min(pullLen / (r * 16), 1) : 0.12
  const angle = Math.atan2(-uy, -ux)
  const tipDist = r * (0.55 + pull * 2.4)
  const stickLen = r * (18 + pull * 4)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)

  const tip = tipDist
  const butt = tipDist + stickLen
  const tipW = r * 0.16
  const buttW = r * 0.4
  const fade = ctx.createLinearGradient(r * 0.15, 0, tip + r * 2.8, 0)
  fade.addColorStop(0, 'rgba(226, 186, 122, 0)')
  fade.addColorStop(0.16, 'rgba(226, 186, 122, 0.12)')
  fade.addColorStop(0.34, 'rgba(214, 164, 92, 0.88)')
  fade.addColorStop(1, 'rgba(150, 92, 40, 1)')

  ctx.beginPath()
  ctx.moveTo(tip, -tipW)
  ctx.lineTo(butt, -buttW)
  ctx.lineTo(butt, buttW)
  ctx.lineTo(tip, tipW)
  ctx.closePath()
  ctx.fillStyle = fade
  ctx.fill()

  ctx.fillStyle = 'rgba(246, 240, 228, 0.92)'
  ctx.fillRect(tip, -tipW, r * 0.42, tipW * 2)
  ctx.fillStyle = 'rgba(30, 40, 70, 0.85)'
  ctx.fillRect(tip, -tipW * 0.7, r * 0.16, tipW * 1.4)
  ctx.restore()
}

function drawAimLine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  aimX: number,
  aimY: number,
  r: number,
) {
  const dx = cx - aimX
  const dy = cy - aimY
  const len = Math.hypot(dx, dy) || 1
  ctx.beginPath()
  ctx.moveTo(cx + (dx / len) * r * 1.15, cy + (dy / len) * r * 1.15)
  ctx.lineTo(cx + dx * 2.1, cy + dy * 2.1)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = Math.max(2, r * 0.12)
  ctx.setLineDash([r * 0.55, r * 0.4])
  ctx.stroke()
  ctx.setLineDash([])
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rad: number,
) {
  const r = Math.min(rad, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCueBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = '#f7f3ea'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.28, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, id: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = BALL_COLOR[id] ?? '#333'
  ctx.fill()
  if (isStripe(id)) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#f7f3ea'
    ctx.fillRect(x - r, y - r * 0.34, r * 2, r * 0.68)
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(x, y, r * 0.38, 0, Math.PI * 2)
  ctx.fillStyle = '#f7f3ea'
  ctx.fill()
  ctx.fillStyle = '#111'
  ctx.font = `700 ${Math.max(8, r * 0.72)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(id), x, y + r * 0.04)
  ctx.beginPath()
  ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.22, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fill()
}
