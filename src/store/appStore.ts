import { create } from 'zustand'
import {
  currentUserSeed,
  discoverIdsSeed,
  incomingLikesSeed,
  profiles,
  standoutIdsSeed,
  threadsSeed,
} from '../data/profiles'
import {
  cupPongAiTurn,
  dropDisc,
  fourAiColumn,
  fourWinner,
  freshPayload,
  wordHuntAiScore,
} from '../games/engine'
import { eightBallAiTurn } from '../games/poolPhysics'
import { pickChatReply } from '../data/chatReplies'
import { isGameId } from '../data/games'
import { HEIGHT_MAX, HEIGHT_MIN, matchesPreferences } from '../lib/filters'
import { uid } from '../lib/id'
import type {
  CupPongPayload,
  EightBallPayload,
  FourInARowPayload,
  GameId,
  GamePreference,
  GameSession,
  Like,
  LikeKind,
  Message,
  DateReview,
  LikeTarget,
  Preferences,
  Profile,
  Thread,
  WordHuntPayload,
} from '../types'

const STORAGE_KEY = 'hinge-mock-user'

interface Persisted {
  currentUser: Profile
  profileCreated: boolean
  dateReviews: Record<string, DateReview>
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted
    if (parsed.currentUser?.games) {
      parsed.currentUser = {
        ...parsed.currentUser,
        games: parsed.currentUser.games.filter((g) => isGameId(g.gameId)),
      }
    }
    return parsed
  } catch {
    return null
  }
}

function persistSlice(state: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

const replyTimers = new Map<string, number>()
const textTimers = new Map<string, number[]>()

function clonePayload<T extends GameSession['payload']>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T
}

function clearReply(sessionId: string) {
  const t = replyTimers.get(sessionId)
  if (t) window.clearTimeout(t)
  replyTimers.delete(sessionId)
}

const jordanSession: GameSession = {
  id: 'game-jordan-4',
  threadId: 'thread-jordan',
  gameId: 'fourInARow',
  status: 'active',
  turn: 'me',
  series: { me: 0, them: 1 },
  payload: {
    kind: 'fourInARow',
    cells: (() => {
      const c = Array(42).fill(0) as (0 | 1 | 2)[]
      c[38] = 2
      c[37] = 1
      c[31] = 2
      c[24] = 1
      c[30] = 2
      return c
    })(),
    winner: 0,
  },
}

interface AppState {
  currentUser: Profile
  profiles: Profile[]
  discoverIds: string[]
  standoutIds: string[]
  skipped: string[]
  incomingLikes: Like[]
  threads: Thread[]
  sessions: Record<string, GameSession>
  sheet: LikeTarget | null
  overlaySessionId: string | null
  typingByThread: Record<string, boolean>
  roses: number
  preferences: Preferences
  toast: string | null
  profileCreated: boolean
  dateReviews: Record<string, DateReview>
  profileById: (id: string) => Profile | undefined
  skip: () => void
  undoSkip: () => void
  skipStandout: () => void
  openSheet: (target: LikeTarget) => void
  closeSheet: () => void
  sendLike: (opts: { comment?: string; kind: LikeKind }) => void
  skipIncoming: (likeId: string) => void
  matchIncoming: (likeId: string, play: boolean) => string | null
  sendMessage: (threadId: string, text: string) => void
  startGame: (threadId: string, gameId: GameId) => string
  rematch: (sessionId: string) => string
  openOverlay: (sessionId: string) => void
  closeOverlay: () => void
  finishWordHunt: (sessionId: string, words: string[], score: number) => void
  playFour: (sessionId: string, col: number) => void
  playCupShot: (sessionId: string, cupIndex: number | null) => void
  playEightShot: (sessionId: string, next: EightBallPayload, keepTurn: boolean) => void
  updateCurrentUser: (patch: Partial<Profile>) => void
  updateGames: (games: GamePreference[]) => void
  setPreferences: (p: Partial<Preferences>) => void
  setToast: (t: string | null) => void
  commitProfile: (profile: Profile) => void
  resetToDemoAlex: () => void
  saveDateReview: (threadId: string, review: DateReview) => void
}

function allProfiles(current: Profile, list: Profile[]) {
  return [current, ...list]
}

const persisted = loadPersisted()

export const useAppStore = create<AppState>((set, get) => {
  const postGameMessage = (
    threadId: string,
    fromId: string,
    sessionId: string,
    payload: GameSession['payload'],
  ) =>
    get().threads.map((t) => {
      if (t.id !== threadId) return t
      const last = [...t.messages].reverse().find((m) => m.gameSessionId === sessionId)
      const next: Message = {
        id: last?.fromId === fromId ? last.id : uid('msg'),
        fromId,
        gameSessionId: sessionId,
        gameSnapshot: clonePayload(payload),
        createdAt: Date.now(),
      }
      return {
        ...t,
        lastActivity: Date.now(),
        messages:
          last?.fromId === fromId
            ? t.messages.map((m) => (m.id === last.id ? next : m))
            : [...t.messages, next],
      }
    })

  const commitTurn = (
    session: GameSession,
    patch: Partial<GameSession>,
    fromId: string,
    send: boolean,
    close: boolean,
  ) => {
    const next: GameSession = { ...session, ...patch }
    set({
      sessions: { ...get().sessions, [session.id]: next },
      overlaySessionId: close ? null : get().overlaySessionId,
      threads: send
        ? postGameMessage(session.threadId, fromId, session.id, next.payload)
        : get().threads,
    })
    if (next.status !== 'complete' && next.turn === 'them') {
      scheduleReply(session.id)
    }
  }

  const applyTheirMove = (sessionId: string) => {
    const session = get().sessions[sessionId]
    if (!session || session.status === 'complete' || session.turn !== 'them') return
    const thread = get().threads.find((t) => t.id === session.threadId)
    if (!thread) return
    const fromId = thread.profileId

    if (session.payload.kind === 'wordHunt') {
      const ai = wordHuntAiScore(session.payload.board)
      const payload: WordHuntPayload = {
        ...session.payload,
        theirWords: ai.words,
        theirScore: ai.score,
        theirPlayed: true,
      }
      const series = {
        me: session.series.me + (payload.myScore > ai.score ? 1 : 0),
        them: session.series.them + (ai.score > payload.myScore ? 1 : 0),
      }
      commitTurn(session, { payload, status: 'complete', series, turn: 'me' }, fromId, true, false)
      return
    }

    if (session.payload.kind === 'fourInARow') {
      const aiCol = fourAiColumn(session.payload.cells)
      const aiDrop = dropDisc(session.payload.cells, aiCol, 2)
      if (!aiDrop) return
      const winner = fourWinner(aiDrop.cells)
      let status: GameSession['status'] = 'active'
      let series = session.series
      if (winner === 2) {
        status = 'complete'
        series = { ...series, them: series.them + 1 }
      } else if (aiDrop.cells.every((c) => c !== 0)) {
        status = 'complete'
      }
      commitTurn(
        session,
        { payload: { kind: 'fourInARow', cells: aiDrop.cells, winner }, status, series, turn: 'me' },
        fromId,
        true,
        false,
      )
      return
    }

    if (session.payload.kind === 'cupPong') {
      const payload = cupPongAiTurn(session.payload)
      let status: GameSession['status'] = 'active'
      let series = session.series
      if (payload.winner === 2) {
        status = 'complete'
        series = { ...series, them: series.them + 1 }
      }
      commitTurn(session, { payload, status, series, turn: 'me' }, fromId, true, false)
      return
    }

    if (session.payload.kind === 'eightBall') {
      const payload = eightBallAiTurn(session.payload)
      let status: GameSession['status'] = 'active'
      let series = session.series
      if (payload.winner === 2 && session.payload.winner !== 2) {
        status = 'complete'
        series = { ...series, them: series.them + 1 }
      } else if (payload.winner === 1 && session.payload.winner !== 1) {
        status = 'complete'
        series = { ...series, me: series.me + 1 }
      }
      commitTurn(session, { payload, status, series, turn: 'me' }, fromId, true, false)
    }
  }

  const scheduleReply = (sessionId: string) => {
    clearReply(sessionId)
    const t = window.setTimeout(() => {
      replyTimers.delete(sessionId)
      applyTheirMove(sessionId)
    }, 1500 + Math.floor(Math.random() * 900))
    replyTimers.set(sessionId, t)
  }

  const clearTextTimers = (threadId: string) => {
    const list = textTimers.get(threadId)
    if (list) list.forEach((id) => window.clearTimeout(id))
    textTimers.delete(threadId)
  }

  const addTextTimer = (threadId: string, id: number) => {
    const list = textTimers.get(threadId) ?? []
    list.push(id)
    textTimers.set(threadId, list)
  }

  const setTyping = (threadId: string, on: boolean) => {
    const current = get().typingByThread[threadId]
    if (Boolean(current) === on) return
    set({ typingByThread: { ...get().typingByThread, [threadId]: on } })
  }

  const receiveText = (threadId: string, text: string) => {
    const thread = get().threads.find((t) => t.id === threadId)
    if (!thread) return
    set({
      typingByThread: { ...get().typingByThread, [threadId]: false },
      threads: get().threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastActivity: Date.now(),
              messages: [
                ...t.messages,
                {
                  id: uid('msg'),
                  fromId: thread.profileId,
                  text,
                  createdAt: Date.now(),
                },
              ],
            }
          : t,
      ),
    })
  }

  const scheduleTextReply = (threadId: string, userText: string) => {
    clearTextTimers(threadId)
    setTyping(threadId, false)
    const thread = get().threads.find((t) => t.id === threadId)
    if (!thread) return
    const inbound = thread.messages.filter((m) => m.fromId !== 'you' && m.text).length
    const lines = pickChatReply(thread.profileId, userText, inbound)
    let at = 520 + Math.floor(Math.random() * 720)
    for (const line of lines) {
      const typeMs = 720 + Math.min(1500, line.length * 36) + Math.floor(Math.random() * 420)
      const startType = at
      const sendAt = at + typeMs
      addTextTimer(
        threadId,
        window.setTimeout(() => {
          if (!get().threads.some((t) => t.id === threadId)) return
          setTyping(threadId, true)
        }, startType),
      )
      addTextTimer(
        threadId,
        window.setTimeout(() => {
          if (!get().threads.some((t) => t.id === threadId)) return
          receiveText(threadId, line)
        }, sendAt),
      )
      at = sendAt + 360 + Math.floor(Math.random() * 520)
    }
  }

  return {
  currentUser: persisted?.currentUser
    ? persisted.currentUser.id === 'you'
      ? {
          ...persisted.currentUser,
          photos: currentUserSeed.photos,
          videoPrompt: currentUserSeed.videoPrompt,
        }
      : persisted.currentUser
    : currentUserSeed,
  profiles,
  discoverIds: [...discoverIdsSeed],
  standoutIds: [...standoutIdsSeed],
  skipped: [],
  incomingLikes: [...incomingLikesSeed],
  threads: threadsSeed.map((t) => ({ ...t, messages: [...t.messages] })),
  sessions: { [jordanSession.id]: jordanSession },
  sheet: null,
  overlaySessionId: null,
  typingByThread: {},
  roses: 1,
  preferences: {
    ageMin: 23,
    ageMax: 34,
    distance: 10,
    nearby: false,
    heightMin: HEIGHT_MIN,
    heightMax: HEIGHT_MAX,
    datingIntent: '',
  },
  toast: null,
  profileCreated: persisted?.profileCreated ?? true,
  dateReviews: persisted?.dateReviews ?? {},

  profileById: (id) => allProfiles(get().currentUser, get().profiles).find((p) => p.id === id),

  skip: () => {
    const { discoverIds, preferences } = get()
    const id = discoverIds.find((candidate) => {
      const profile = get().profileById(candidate)
      return Boolean(profile && matchesPreferences(profile, preferences))
    })
    if (!id) return
    set({
      discoverIds: discoverIds.filter((candidate) => candidate !== id),
      skipped: [...get().skipped, id],
    })
  },

  undoSkip: () => {
    const skipped = get().skipped
    const id = skipped[skipped.length - 1]
    if (!id) return
    set({
      skipped: skipped.slice(0, -1),
      discoverIds: [id, ...get().discoverIds],
    })
  },

  skipStandout: () => {
    const ids = get().standoutIds
    if (!ids[0]) return
    set({ standoutIds: ids.slice(1) })
  },

  openSheet: (target) => set({ sheet: target }),
  closeSheet: () => set({ sheet: null }),

  sendLike: ({ comment, kind }) => {
    const sheet = get().sheet
    if (!sheet) return
    const roses =
      kind === 'rose' || sheet.roseOnly ? Math.max(0, get().roses - 1) : get().roses
    void comment
    set({
      discoverIds: get().discoverIds.filter((id) => id !== sheet.profileId),
      standoutIds: get().standoutIds.filter((id) => id !== sheet.profileId),
      sheet: null,
      roses,
      toast: kind === 'challenge' ? 'Invite sent' : kind === 'rose' ? 'Rose sent' : 'Sent',
    })
  },

  skipIncoming: (likeId) => {
    set({ incomingLikes: get().incomingLikes.filter((l) => l.id !== likeId) })
  },

  matchIncoming: (likeId, play) => {
    const like = get().incomingLikes.find((l) => l.id === likeId)
    if (!like) return null
    const existing = get().threads.find((t) => t.profileId === like.fromId)
    if (existing) {
      set({ incomingLikes: get().incomingLikes.filter((l) => l.id !== likeId) })
      if (like.gameId && (like.kind === 'challenge' || like.targetType === 'game')) {
        const sid = get().startGame(existing.id, like.gameId)
        if (play) get().openOverlay(sid)
      }
      return existing.id
    }
    const threadId = uid('thread')
    const messages: Message[] = like.comment
      ? [
          {
            id: uid('msg'),
            fromId: like.fromId,
            text: like.comment,
            createdAt: like.createdAt,
          },
        ]
      : []
    let gameSessionId: string | undefined
    const sessions = { ...get().sessions }
    if (like.gameId && (like.kind === 'challenge' || like.targetType === 'game')) {
      const session: GameSession = {
        id: uid('game'),
        threadId,
        gameId: like.gameId,
        status: 'pending',
        turn: 'me',
        series: { me: 0, them: 0 },
        payload: freshPayload(like.gameId),
      }
      sessions[session.id] = session
      gameSessionId = session.id
      messages.push({
        id: uid('msg'),
        fromId: like.fromId,
        gameSessionId: session.id,
        gameSnapshot: clonePayload(session.payload),
        createdAt: Date.now(),
      })
    }
    const thread: Thread = {
      id: threadId,
      profileId: like.fromId,
      like,
      messages,
      gameSessionId,
      lastActivity: Date.now(),
    }
    set({
      incomingLikes: get().incomingLikes.filter((l) => l.id !== likeId),
      threads: [thread, ...get().threads],
      sessions,
      toast: get().profileById(like.fromId)?.name ?? 'Matched',
    })
    if (play && gameSessionId) get().openOverlay(gameSessionId)
    return threadId
  },

  sendMessage: (threadId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    set({
      threads: get().threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              lastActivity: Date.now(),
              messages: [
                ...t.messages,
                { id: uid('msg'), fromId: 'you', text: trimmed, createdAt: Date.now() },
              ],
            }
          : t,
      ),
    })
    scheduleTextReply(threadId, trimmed)
  },

  startGame: (threadId, gameId) => {
    const prevId = get().threads.find((t) => t.id === threadId)?.gameSessionId
    if (prevId) clearReply(prevId)
    const session: GameSession = {
      id: uid('game'),
      threadId,
      gameId,
      status: 'pending',
      turn: 'me',
      series: (prevId ? get().sessions[prevId]?.series : undefined) ?? { me: 0, them: 0 },
      payload: freshPayload(gameId),
    }
    set({
      sessions: { ...get().sessions, [session.id]: session },
      threads: get().threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              gameSessionId: session.id,
              lastActivity: Date.now(),
              messages: [
                ...t.messages,
                {
                  id: uid('msg'),
                  fromId: 'you',
                  gameSessionId: session.id,
                  gameSnapshot: clonePayload(session.payload),
                  createdAt: Date.now(),
                },
              ],
            }
          : t,
      ),
    })
    return session.id
  },

  rematch: (sessionId) => {
    const prev = get().sessions[sessionId]
    if (!prev) return sessionId
    return get().startGame(prev.threadId, prev.gameId)
  },

  openOverlay: (sessionId) => set({ overlaySessionId: sessionId }),
  closeOverlay: () => {
    const id = get().overlaySessionId
    const session = id ? get().sessions[id] : undefined
    if (session) {
      const hasMsg = get().threads.some((t) =>
        t.messages.some((m) => m.gameSessionId === session.id),
      )
      if (!hasMsg) {
        set({
          overlaySessionId: null,
          threads: postGameMessage(session.threadId, 'you', session.id, session.payload),
        })
        return
      }
    }
    set({ overlaySessionId: null })
  },

  finishWordHunt: (sessionId, words, score) => {
    const session = get().sessions[sessionId]
    if (
      !session ||
      session.payload.kind !== 'wordHunt' ||
      session.status === 'complete' ||
      session.payload.myPlayed
    )
      return
    const payload: WordHuntPayload = {
      ...session.payload,
      myWords: words,
      myScore: score,
      myPlayed: true,
    }
    commitTurn(session, { payload, status: 'active', turn: 'them' }, 'you', true, true)
  },

  playFour: (sessionId, col) => {
    const session = get().sessions[sessionId]
    if (
      !session ||
      session.payload.kind !== 'fourInARow' ||
      session.turn !== 'me' ||
      session.status === 'complete'
    )
      return
    const dropped = dropDisc(session.payload.cells, col, 1)
    if (!dropped) return
    const winner = fourWinner(dropped.cells)
    let turn: 'me' | 'them' = 'them'
    let status: GameSession['status'] = 'active'
    let series = session.series
    if (winner === 1) {
      status = 'complete'
      series = { ...series, me: series.me + 1 }
      turn = 'me'
    } else if (dropped.cells.every((c) => c !== 0)) {
      status = 'complete'
    }
    const payload: FourInARowPayload = { kind: 'fourInARow', cells: dropped.cells, winner }
    commitTurn(session, { payload, turn, status, series }, 'you', true, true)
  },

  playCupShot: (sessionId, cupIndex) => {
    const session = get().sessions[sessionId]
    if (
      !session ||
      session.payload.kind !== 'cupPong' ||
      session.turn !== 'me' ||
      session.status === 'complete'
    )
      return
    const cups = session.payload.cups.slice()
    let hits = session.payload.hitsThisTurn
    if (cupIndex !== null && cups[cupIndex]) {
      cups[cupIndex] = false
      hits += 1
    }
    let shotsLeft = session.payload.shotsLeft - 1
    let turn = session.turn
    let status: GameSession['status'] = 'active'
    let series = session.series
    let winner: 0 | 1 | 2 = 0
    let send = false

    if (!cups.some(Boolean)) {
      winner = 1
      status = 'complete'
      series = { ...series, me: series.me + 1 }
      send = true
    } else if (shotsLeft <= 0) {
      if (hits === 2) {
        shotsLeft = 2
        hits = 0
      } else {
        turn = 'them'
        shotsLeft = 2
        hits = 0
        send = true
      }
    }

    const payload: CupPongPayload = {
      kind: 'cupPong',
      cups,
      shotsLeft,
      hitsThisTurn: hits,
      winner,
    }
    commitTurn(session, { payload, turn, status, series }, 'you', send, send)
  },

  playEightShot: (sessionId, next, keepTurn) => {
    const session = get().sessions[sessionId]
    if (
      !session ||
      session.payload.kind !== 'eightBall' ||
      session.turn !== 'me' ||
      session.status === 'complete'
    )
      return
    let turn = session.turn
    let status: GameSession['status'] = 'active'
    let series = session.series
    let send = false
    if (next.winner === 1 && session.payload.winner !== 1) {
      status = 'complete'
      series = { ...series, me: series.me + 1 }
      send = true
    } else if (next.winner === 2 && session.payload.winner !== 2) {
      status = 'complete'
      series = { ...series, them: series.them + 1 }
      send = true
    } else if (next.winner === 0 && !keepTurn) {
      turn = 'them'
      send = true
    }
    commitTurn(session, { payload: next, turn, status, series }, 'you', send, send)
  },

  updateCurrentUser: (patch) => {
    const currentUser = { ...get().currentUser, ...patch }
    set({ currentUser })
    persistSlice({
      currentUser,
      profileCreated: get().profileCreated,
      dateReviews: get().dateReviews,
    })
  },

  updateGames: (games) => {
    const currentUser = { ...get().currentUser, games }
    set({ currentUser })
    persistSlice({
      currentUser,
      profileCreated: get().profileCreated,
      dateReviews: get().dateReviews,
    })
  },

  setPreferences: (p) => set({ preferences: { ...get().preferences, ...p } }),
  setToast: (t) => set({ toast: t }),

  commitProfile: (profile) => {
    const currentUser = { ...profile, id: 'you', distance: '0 mi' }
    set({ currentUser, profileCreated: true })
    persistSlice({ currentUser, profileCreated: true, dateReviews: get().dateReviews })
  },

  resetToDemoAlex: () => {
    set({ currentUser: currentUserSeed, profileCreated: true, toast: 'Demo' })
    persistSlice({
      currentUser: currentUserSeed,
      profileCreated: true,
      dateReviews: get().dateReviews,
    })
  },

  saveDateReview: (threadId, review) => {
    const dateReviews = { ...get().dateReviews, [threadId]: review }
    set({ dateReviews, toast: 'Saved' })
    persistSlice({
      currentUser: get().currentUser,
      profileCreated: get().profileCreated,
      dateReviews,
    })
  },
  }
})

export function threadTurn(thread: Thread, sessions: Record<string, GameSession>): 'me' | 'them' {
  const session = thread.gameSessionId ? sessions[thread.gameSessionId] : undefined
  if (session && session.status !== 'complete') return session.turn
  const last = thread.messages[thread.messages.length - 1]
  if (!last) return 'me'
  return last.fromId === 'you' ? 'them' : 'me'
}
