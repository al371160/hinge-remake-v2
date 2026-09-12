import type { EightBallPayload, PoolBallState } from '../types'

export const TABLE_W = 1
export const TABLE_H = 2
export const BALL_R = 0.033
export const POCKET_R = 0.058

export const POCKETS: { x: number; y: number }[] = [
  { x: 0, y: 0 },
  { x: TABLE_W, y: 0 },
  { x: 0, y: TABLE_H / 2 },
  { x: TABLE_W, y: TABLE_H / 2 },
  { x: 0, y: TABLE_H },
  { x: TABLE_W, y: TABLE_H },
]

export const BALL_COLOR: Record<number, string> = {
  1: '#E8B423',
  2: '#1E4FA3',
  3: '#C62828',
  4: '#5A2D82',
  5: '#E07020',
  6: '#1A7A38',
  7: '#6B1C1C',
  8: '#111111',
  9: '#E8B423',
  10: '#1E4FA3',
  11: '#C62828',
  12: '#5A2D82',
  13: '#E07020',
  14: '#1A7A38',
  15: '#6B1C1C',
}

export function isSolid(id: number) {
  return id >= 1 && id <= 7
}

export function isStripe(id: number) {
  return id >= 9 && id <= 15
}

export function isEight(id: number) {
  return id === 8
}

type Sim = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  pocketed: boolean
}

function rackPositions() {
  const apexX = 0.5
  const apexY = 0.7
  const gap = BALL_R * 2.08
  const spots: { x: number; y: number }[] = []
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i <= row; i++) {
      spots.push({
        x: apexX - (row * gap) / 2 + i * gap,
        y: apexY - row * gap * 0.87,
      })
    }
  }
  return spots
}

const RACK_ORDER = [1, 9, 2, 8, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]

export function emptyEightBall(): EightBallPayload {
  const spots = rackPositions()
  const balls: PoolBallState[] = RACK_ORDER.map((id, i) => ({
    id,
    x: spots[i]!.x + (Math.random() - 0.5) * 0.004,
    y: spots[i]!.y + (Math.random() - 0.5) * 0.004,
    pocketed: false,
  }))
  return {
    kind: 'eightBall',
    balls,
    cue: { x: 0.5, y: 1.48, pocketed: false },
    assignment: 0,
    winner: 0,
  }
}

function toSim(payload: EightBallPayload): Sim[] {
  return [
    {
      id: 0,
      x: payload.cue.x,
      y: payload.cue.y,
      vx: 0,
      vy: 0,
      pocketed: payload.cue.pocketed,
    },
    ...payload.balls.map((b) => ({
      id: b.id,
      x: b.x,
      y: b.y,
      vx: 0,
      vy: 0,
      pocketed: b.pocketed,
    })),
  ]
}

function nearPocket(x: number, y: number, scale: number) {
  return POCKETS.some((p) => Math.hypot(x - p.x, y - p.y) < POCKET_R * scale)
}

function step(balls: Sim[], pocketed: number[]) {
  for (const b of balls) {
    if (b.pocketed) continue
    b.x += b.vx
    b.y += b.vy
    b.vx *= 0.988
    b.vy *= 0.988
    if (Math.hypot(b.vx, b.vy) < 0.00035) {
      b.vx = 0
      b.vy = 0
    }
  }

  for (const b of balls) {
    if (b.pocketed) continue
    const off =
      b.x < -BALL_R * 0.2 ||
      b.x > TABLE_W + BALL_R * 0.2 ||
      b.y < -BALL_R * 0.2 ||
      b.y > TABLE_H + BALL_R * 0.2
    if (nearPocket(b.x, b.y, 0.78) || (off && nearPocket(b.x, b.y, 1.85))) {
      b.pocketed = true
      b.vx = 0
      b.vy = 0
      pocketed.push(b.id)
    }
  }

  for (const b of balls) {
    if (b.pocketed) continue
    if (nearPocket(b.x, b.y, 1.12)) continue
    if (b.x < BALL_R) {
      b.x = BALL_R
      b.vx = Math.abs(b.vx) * 0.82
    } else if (b.x > TABLE_W - BALL_R) {
      b.x = TABLE_W - BALL_R
      b.vx = -Math.abs(b.vx) * 0.82
    }
    if (b.y < BALL_R) {
      b.y = BALL_R
      b.vy = Math.abs(b.vy) * 0.82
    } else if (b.y > TABLE_H - BALL_R) {
      b.y = TABLE_H - BALL_R
      b.vy = -Math.abs(b.vy) * 0.82
    }
    b.x = Math.min(TABLE_W - BALL_R, Math.max(BALL_R, b.x))
    b.y = Math.min(TABLE_H - BALL_R, Math.max(BALL_R, b.y))
  }

  for (let i = 0; i < balls.length; i++) {
    const a = balls[i]!
    if (a.pocketed) continue
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j]!
      if (b.pocketed) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy)
      if (dist === 0 || dist >= BALL_R * 2) continue
      const nx = dx / dist
      const ny = dy / dist
      const overlap = BALL_R * 2 - dist
      a.x -= nx * overlap * 0.5
      a.y -= ny * overlap * 0.5
      b.x += nx * overlap * 0.5
      b.y += ny * overlap * 0.5
      const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
      if (dvn <= 0) continue
      a.vx -= dvn * nx
      a.vy -= dvn * ny
      b.vx += dvn * nx
      b.vy += dvn * ny
    }
  }
}

function moving(balls: Sim[]) {
  return balls.some((b) => !b.pocketed && (b.vx !== 0 || b.vy !== 0))
}

export type ShotFrame = {
  balls: Sim[]
  pocketed: number[]
}

export function runShot(payload: EightBallPayload, vx: number, vy: number): ShotFrame[] {
  const balls = toSim(payload)
  const cue = balls.find((b) => b.id === 0)!
  cue.pocketed = false
  cue.vx = vx
  cue.vy = vy
  const pocketed: number[] = []
  const frames: ShotFrame[] = []
  let guard = 0
  while (guard++ < 520) {
    step(balls, pocketed)
    if (guard % 2 === 0) {
      frames.push({
        balls: balls.map((b) => ({ ...b })),
        pocketed: pocketed.slice(),
      })
    }
    if (!moving(balls)) break
  }
  if (!frames.length) {
    frames.push({ balls: balls.map((b) => ({ ...b })), pocketed })
  }
  return frames
}

function groupClear(balls: PoolBallState[], solids: boolean) {
  const group = balls.filter((b) => (solids ? isSolid(b.id) : isStripe(b.id)))
  return group.length >= 7 && group.every((b) => b.pocketed)
}

function legalIds(assignment: 0 | 1 | 2, shooter: 1 | 2, canEight: boolean) {
  const mineSolids = shooter === 1 ? assignment === 1 : assignment === 2
  const mineStripes = shooter === 1 ? assignment === 2 : assignment === 1
  const ids: number[] = []
  if (assignment === 0) {
    for (let i = 1; i <= 15; i++) if (i !== 8) ids.push(i)
  } else if (mineSolids) {
    for (let i = 1; i <= 7; i++) ids.push(i)
  } else if (mineStripes) {
    for (let i = 9; i <= 15; i++) ids.push(i)
  }
  if (canEight) ids.push(8)
  return ids
}

export function applyEightShot(
  before: EightBallPayload,
  afterBalls: Sim[],
  pocketed: number[],
  shooter: 1 | 2,
): { payload: EightBallPayload; keepTurn: boolean } {
  const scratch = pocketed.includes(0)
  const eightDown = pocketed.includes(8)
  let assignment = before.assignment

  const objectPocketed = pocketed.filter((id) => id !== 0)
  if (assignment === 0) {
    const first = objectPocketed.find((id) => !isEight(id))
    if (first !== undefined) {
      const solid = isSolid(first)
      if (shooter === 1) assignment = solid ? 1 : 2
      else assignment = solid ? 2 : 1
    }
  }

  const balls: PoolBallState[] = afterBalls
    .filter((b) => b.id !== 0)
    .map((b) => ({ id: b.id, x: b.x, y: b.y, pocketed: b.pocketed }))
  const cueBall = afterBalls.find((b) => b.id === 0)!
  let cue = { x: cueBall.x, y: cueBall.y, pocketed: false }
  if (scratch) cue = spotCue(balls)

  const meSolids = assignment === 1
  const shooterSolids = shooter === 1 ? meSolids : assignment === 2
  const ownClear = assignment !== 0 && groupClear(balls, shooterSolids)
  const ownClearBefore =
    before.assignment !== 0 &&
    groupClear(before.balls, shooter === 1 ? before.assignment === 1 : before.assignment === 2)

  let winner: 0 | 1 | 2 = 0
  if (eightDown) {
    const legalEight = ownClearBefore || (assignment !== 0 && ownClear && objectPocketed.length === 1)
    if (scratch || !legalEight) winner = shooter === 1 ? 2 : 1
    else winner = shooter
  }

  const legal = legalIds(assignment, shooter, ownClearBefore)
  const hitLegal = objectPocketed.some((id) => legal.includes(id))
  const keepTurn = winner === 0 && !scratch && hitLegal

  return {
    payload: {
      kind: 'eightBall',
      balls,
      cue,
      assignment,
      winner,
    },
    keepTurn,
  }
}

function spotCue(balls: PoolBallState[]) {
  const tries = [
    { x: 0.5, y: 1.5 },
    { x: 0.42, y: 1.5 },
    { x: 0.58, y: 1.5 },
    { x: 0.5, y: 1.38 },
    { x: 0.5, y: 1.62 },
  ]
  for (const t of tries) {
    const clash = balls.some((b) => !b.pocketed && Math.hypot(b.x - t.x, b.y - t.y) < BALL_R * 2.2)
    if (!clash) return { ...t, pocketed: false }
  }
  return { x: 0.5, y: 1.72, pocketed: false }
}

export function toPortrait(payload: EightBallPayload): EightBallPayload {
  const landscape = payload.cue.x > 1.02 || payload.balls.some((b) => b.x > 1.02)
  if (!landscape) return payload
  const rot = (x: number, y: number) => ({ x: y, y: 2 - x })
  return {
    ...payload,
    cue: { ...payload.cue, ...rot(payload.cue.x, payload.cue.y) },
    balls: payload.balls.map((b) => ({ ...b, ...rot(b.x, b.y) })),
  }
}

export function eightBallAiTurn(payload: EightBallPayload): EightBallPayload {
  let current = toPortrait(payload)
  for (let i = 0; i < 10 && !current.winner; i++) {
    const aim = eightBallAiAim(current)
    const frames = runShot(current, aim.vx, aim.vy)
    const last = frames[frames.length - 1]
    if (!last) break
    const result = applyEightShot(current, last.balls, last.pocketed, 2)
    current = result.payload
    if (!result.keepTurn) break
  }
  return current
}

export function eightBallAiAim(payload: EightBallPayload): { vx: number; vy: number } {
  const shooter: 1 | 2 = 2
  const ownClear = payload.assignment !== 0 && groupClear(payload.balls, payload.assignment === 2)
  const legal = legalIds(payload.assignment, shooter, ownClear)
  const targets = payload.balls.filter((b) => !b.pocketed && legal.includes(b.id))
  const ball =
    targets[Math.floor(Math.random() * targets.length)] ??
    payload.balls.find((b) => !b.pocketed && b.id !== 8)
  if (!ball) return { vx: 0, vy: -0.04 }
  let best = POCKETS[0]!
  let bestD = 99
  for (const p of POCKETS) {
    const d = Math.hypot(ball.x - p.x, ball.y - p.y)
    if (d < bestD) {
      best = p
      bestD = d
    }
  }
  const tx = ball.x + (ball.x - best.x) * 0.08
  const ty = ball.y + (ball.y - best.y) * 0.08
  const dx = tx - payload.cue.x + (Math.random() - 0.5) * 0.04
  const dy = ty - payload.cue.y + (Math.random() - 0.5) * 0.04
  const len = Math.hypot(dx, dy) || 1
  const power = 0.042 + Math.random() * 0.018
  return { vx: (dx / len) * power, vy: (dy / len) * power }
}

export function maxShotSpeed() {
  return 0.078
}

export function ballsOnTable(payload: EightBallPayload) {
  if (payload.cue.pocketed) return false
  if (
    payload.cue.x < 0 ||
    payload.cue.x > TABLE_W ||
    payload.cue.y < 0 ||
    payload.cue.y > TABLE_H
  ) {
    return false
  }
  return payload.balls.every(
    (b) =>
      b.pocketed || (b.x >= 0 && b.x <= TABLE_W && b.y >= 0 && b.y <= TABLE_H),
  )
}
