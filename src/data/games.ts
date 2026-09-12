import type { GameId, GameVibe } from '../types'

export const GAME_META: Record<GameId, { name: string; short: string; blurb: string }> = {
  eightBall: {
    name: '8 Ball',
    short: '8 Ball',
    blurb: 'Solids, stripes, then the 8.',
  },
  wordHunt: {
    name: 'Word Hunt',
    short: 'Word Hunt',
    blurb: 'Same 4×4. Eighty seconds.',
  },
  fourInARow: {
    name: '4 in a Row',
    short: '4 in a Row',
    blurb: 'Drop a disc. Wait.',
  },
  cupPong: {
    name: 'Cup Pong',
    short: 'Cup Pong',
    blurb: 'Two shots. Ten cups.',
  },
}

export const GAME_IDS: GameId[] = ['eightBall', 'wordHunt', 'fourInARow', 'cupPong']

export const VIBE_LABEL: Record<GameVibe, string> = {
  forFun: 'For fun',
  competitive: 'Competitive',
  teachMe: 'Teach me',
}

export function isGameId(id: string | undefined): id is GameId {
  return Boolean(id && id in GAME_META)
}

export function gameMeta(id: string | undefined) {
  return isGameId(id) ? GAME_META[id] : GAME_META.eightBall
}

export function gameName(id: GameId) {
  return GAME_META[id].name
}
