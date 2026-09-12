import { WORDS } from '../data/wordlist'
import type {
  CupPongPayload,
  FourInARowPayload,
  GameId,
  GamePayload,
  WordHuntPayload,
} from '../types'
import { emptyEightBall } from './poolPhysics'

export const WORD_SCORE: Record<number, number> = {
  3: 100,
  4: 400,
  5: 800,
  6: 1400,
  7: 1800,
}

export function wordScore(word: string) {
  if (word.length >= 8) return 2200
  return WORD_SCORE[word.length] ?? 0
}

const FREQ = 'eeeeeeeeeeaaaaaaaarrrrrrrriiiiiiooooontttttnsssllllcccddduuuppmghhbbffyywwkkvxzjq'

export function makeWordHuntBoard(): string[] {
  const seeded = [
    'heartskidocampqx',
    'dateskissloverun',
    'charmwinegoldyes',
    'smilewarmholdcut',
  ]
  const pick = seeded[Math.floor(Math.random() * seeded.length)]
  if (Math.random() < 0.55) return pick.slice(0, 16).toUpperCase().split('')
  return Array.from({ length: 16 }, () => FREQ[Math.floor(Math.random() * FREQ.length)]!.toUpperCase())
}

const DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

function neighbors(i: number) {
  const r = Math.floor(i / 4)
  const c = i % 4
  const out: number[] = []
  for (const [dr, dc] of DIRS) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) out.push(nr * 4 + nc)
  }
  return out
}

export function isAdjacentPath(path: number[]) {
  for (let i = 1; i < path.length; i++) {
    if (!neighbors(path[i - 1]!).includes(path[i]!)) return false
  }
  return new Set(path).size === path.length
}

export function pathWord(board: string[], path: number[]) {
  return path.map((i) => board[i]).join('')
}

export function isValidWord(word: string) {
  return WORDS.has(word.toLowerCase())
}

export function findAllWords(board: string[]) {
  const found = new Set<string>()
  const visit = (i: number, used: Set<number>, prefix: string) => {
    if (prefix.length >= 3 && WORDS.has(prefix.toLowerCase())) found.add(prefix)
    if (prefix.length >= 8) return
    for (const n of neighbors(i)) {
      if (used.has(n)) continue
      const next = prefix + board[n]
      used.add(n)
      visit(n, used, next)
      used.delete(n)
    }
  }
  for (let i = 0; i < 16; i++) {
    visit(i, new Set([i]), board[i]!)
  }
  return [...found]
}

export function wordHuntAiScore(board: string[]) {
  const all = findAllWords(board)
  const sorted = all.sort((a, b) => b.length - a.length)
  const take = sorted.slice(0, 8 + Math.floor(Math.random() * 7))
  const extras = sorted.filter((w) => w.length === 3).slice(0, 6)
  const words = [...new Set([...take, ...extras])]
  const score = words.reduce((s, w) => s + wordScore(w), 0)
  return { words, score }
}

export function emptyFourInARow(): FourInARowPayload {
  return { kind: 'fourInARow', cells: Array(42).fill(0) as (0 | 1 | 2)[], winner: 0 }
}

export function dropDisc(cells: (0 | 1 | 2)[], col: number, player: 1 | 2) {
  for (let row = 5; row >= 0; row--) {
    const i = row * 7 + col
    if (cells[i] === 0) {
      const next = cells.slice() as (0 | 1 | 2)[]
      next[i] = player
      return { cells: next, index: i }
    }
  }
  return null
}

function lineWin(cells: (0 | 1 | 2)[], start: number, dr: number, dc: number) {
  const p = cells[start]
  if (!p) return 0
  const sr = Math.floor(start / 7)
  const sc = start % 7
  for (let k = 1; k < 4; k++) {
    const r = sr + dr * k
    const c = sc + dc * k
    if (r < 0 || r > 5 || c < 0 || c > 6) return 0
    if (cells[r * 7 + c] !== p) return 0
  }
  return p
}

export function fourWinner(cells: (0 | 1 | 2)[]): 0 | 1 | 2 {
  for (let i = 0; i < 42; i++) {
    for (const [dr, dc] of [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ] as const) {
      const w = lineWin(cells, i, dr, dc)
      if (w) return w
    }
  }
  return cells.every((c) => c !== 0) ? 0 : 0
}

export function fourAiColumn(cells: (0 | 1 | 2)[]) {
  const legal = (col: number) => cells[col] === 0
  const tryWin = (player: 1 | 2) => {
    for (let col = 0; col < 7; col++) {
      if (!legal(col)) continue
      const dropped = dropDisc(cells, col, player)
      if (dropped && fourWinner(dropped.cells) === player) return col
    }
    return null
  }
  return tryWin(2) ?? tryWin(1) ?? [3, 2, 4, 1, 5, 0, 6].find(legal) ?? 3
}

export function emptyCupPong(): CupPongPayload {
  return {
    kind: 'cupPong',
    cups: Array(10).fill(true),
    shotsLeft: 2,
    hitsThisTurn: 0,
    winner: 0,
  }
}

export function cupPongAiTurn(payload: CupPongPayload): CupPongPayload {
  const cups = payload.cups.slice()
  let shots = 2
  let hits = 0
  let loops = 0
  while (shots > 0 && cups.some(Boolean) && loops < 6) {
    shots -= 1
    const left = cups.map((c, i) => (c ? i : -1)).filter((i) => i >= 0)
    if (Math.random() > 0.38 && left.length) {
      const pick = left[Math.floor(Math.random() * left.length)]!
      cups[pick] = false
      hits += 1
    }
    if (shots === 0 && hits === 2 && cups.some(Boolean)) {
      shots = 2
      hits = 0
      loops += 1
    }
  }
  return {
    kind: 'cupPong',
    cups,
    shotsLeft: 2,
    hitsThisTurn: 0,
    winner: cups.some(Boolean) ? 0 : 2,
  }
}

export function cupPositions(w: number, h: number) {
  const rows = [4, 3, 2, 1]
  const cups: { x: number; y: number; r: number }[] = []
  const top = h * 0.2
  const gapY = Math.min(44, h * 0.085)
  const gapX = Math.min(38, w * 0.1)
  const r = Math.min(15, w * 0.042)
  for (let row = 0; row < rows.length; row++) {
    const count = rows[row]!
    const rowW = (count - 1) * gapX
    const y = top + row * gapY
    for (let c = 0; c < count; c++) {
      cups.push({ x: w / 2 - rowW / 2 + c * gapX, y, r })
    }
  }
  return cups
}

export function freshPayload(gameId: GameId): GamePayload {
  switch (gameId) {
    case 'wordHunt': {
      const board = makeWordHuntBoard()
      return {
        kind: 'wordHunt',
        board,
        myWords: [],
        theirWords: [],
        myScore: 0,
        theirScore: 0,
        myPlayed: false,
        theirPlayed: false,
      } satisfies WordHuntPayload
    }
    case 'fourInARow':
      return emptyFourInARow()
    case 'eightBall':
      return emptyEightBall()
    case 'cupPong':
      return emptyCupPong()
    default: {
      const _never: never = gameId
      void _never
      return emptyEightBall()
    }
  }
}
