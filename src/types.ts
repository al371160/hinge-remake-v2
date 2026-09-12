export type GameId = 'wordHunt' | 'fourInARow' | 'cupPong' | 'eightBall'
export type GameVibe = 'forFun' | 'competitive' | 'teachMe'
export type LikeKind = 'like' | 'rose' | 'challenge'
export type TargetType = 'photo' | 'prompt' | 'game' | 'voice' | 'video' | 'poll'
export type MediaKind = 'photo' | 'video'
export type PromptCategory =
  | 'aboutMe'
  | 'myType'
  | 'letsChat'
  | 'dateVibes'
  | 'storytime'
  | 'selfCare'
  | 'yourWorld'
  | 'lgbtqia'
  | 'gettingPersonal'
  | 'voiceFirst'
export type Turn = 'me' | 'them'

export interface GamePreference {
  gameId: GameId
  favorite: boolean
  vibe: GameVibe
  oneLiner: string
}

export interface Prompt {
  id: string
  question: string
  answer: string
  category?: PromptCategory
}

export interface Photo {
  id: string
  url: string
  alt: string
  kind?: MediaKind
  videoUrl?: string
  caption?: string
  location?: string
}

export interface VoicePrompt {
  id: string
  question: string
  spoken: string
  durationSec: number
  category?: PromptCategory
}

export interface VideoPrompt {
  id: string
  question: string
  url: string
  poster: string
  caption?: string
  category?: PromptCategory
}

export interface PromptPoll {
  id: string
  question: string
  options: string[]
}

export interface Vitals {
  job?: string
  education?: string
  location: string
  height?: string
  hometown?: string
  intentions?: string
}

export interface Profile {
  id: string
  name: string
  age: number
  verified: boolean
  pronouns?: string
  newHere?: boolean
  location: string
  distance: string
  photos: Photo[]
  prompts: Prompt[]
  vitals: Vitals
  games: GamePreference[]
  acceptChallenges: boolean
  standout?: boolean
  voicePrompt?: VoicePrompt
  videoPrompt?: VideoPrompt
  poll?: PromptPoll
}

export interface Like {
  id: string
  fromId: string
  toId: string
  targetType: TargetType
  targetId: string
  comment?: string
  kind: LikeKind
  gameId?: GameId
  createdAt: number
}

export interface WordHuntPayload {
  kind: 'wordHunt'
  board: string[]
  myWords: string[]
  theirWords: string[]
  myScore: number
  theirScore: number
  myPlayed: boolean
  theirPlayed: boolean
}

export interface FourInARowPayload {
  kind: 'fourInARow'
  cells: (0 | 1 | 2)[]
  winner: 0 | 1 | 2
}

export interface CupPongPayload {
  kind: 'cupPong'
  cups: boolean[]
  shotsLeft: number
  hitsThisTurn: number
  winner: 0 | 1 | 2
}

export interface PoolBallState {
  id: number
  x: number
  y: number
  pocketed: boolean
}

export interface EightBallPayload {
  kind: 'eightBall'
  balls: PoolBallState[]
  cue: { x: number; y: number; pocketed: boolean }
  assignment: 0 | 1 | 2
  winner: 0 | 1 | 2
}

export type GamePayload = WordHuntPayload | FourInARowPayload | CupPongPayload | EightBallPayload

export interface Message {
  id: string
  fromId: string
  text?: string
  gameSessionId?: string
  gameSnapshot?: GamePayload
  createdAt: number
}

export interface GameSession {
  id: string
  threadId: string
  gameId: GameId
  status: 'pending' | 'active' | 'complete'
  turn: Turn
  series: { me: number; them: number }
  payload: GamePayload
}

export interface Thread {
  id: string
  profileId: string
  like: Like
  messages: Message[]
  gameSessionId?: string
  lastActivity: number
}

export interface LikeTarget {
  profileId: string
  targetType: TargetType
  targetId: string
  gameId?: GameId
  roseOnly?: boolean
}

export interface Preferences {
  ageMin: number
  ageMax: number
  distance: number
  nearby: boolean
  heightMin: number
  heightMax: number
  datingIntent: string
}

export interface DateReview {
  met: 'yes' | 'notYet' | 'no'
  again?: boolean
  note?: string
  overall?: number
  chemistry?: number
  conversation?: number
  safety?: number
  tags?: string[]
}
