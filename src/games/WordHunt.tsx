import { useEffect, useMemo, useRef, useState } from 'react'
import { isAdjacentPath, isValidWord, pathWord, wordScore } from './engine'

interface Props {
  board: string[]
  onFinish: (words: string[], score: number) => void
}

export function WordHunt({ board, onFinish }: Props) {
  const [path, setPath] = useState<number[]>([])
  const [words, setWords] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(80)
  const [flash, setFlash] = useState<string | null>(null)
  const drawing = useRef(false)
  const finished = useRef(false)
  const pathRef = useRef<number[]>([])
  const wordsRef = useRef(words)
  const scoreRef = useRef(score)
  wordsRef.current = words
  scoreRef.current = score
  pathRef.current = path

  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  useEffect(() => {
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t)
          if (!finished.current) {
            finished.current = true
            onFinishRef.current(wordsRef.current, scoreRef.current)
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  const current = useMemo(() => pathWord(board, path), [board, path])

  const commit = (nextPath: number[]) => {
    if (nextPath.length < 3 || !isAdjacentPath(nextPath)) return
    const word = pathWord(board, nextPath)
    if (!isValidWord(word)) {
      setFlash('—')
      return
    }
    if (wordsRef.current.includes(word)) {
      setFlash('Already found')
      return
    }
    const next = [...wordsRef.current, word]
    const nextScore = scoreRef.current + wordScore(word)
    setWords(next)
    setScore(nextScore)
    setFlash(`+${wordScore(word)}`)
  }

  const cellFromPoint = (el: HTMLElement, clientX: number, clientY: number) => {
    const node = document.elementFromPoint(clientX, clientY) as HTMLElement | null
    const cell = node?.closest('[data-cell]') as HTMLElement | null
    if (!cell || !el.contains(cell)) return null
    return Number(cell.dataset.cell)
  }

  return (
    <div className="flex h-full flex-col bg-[#f3ebe3] px-6 pt-3 pb-6">
      <div className="flex items-end justify-between">
        <p className="type-title">{score.toLocaleString()}</p>
        <p className="type-title tabular-nums">{seconds}</p>
      </div>
      <p className="type-chrome mt-1 min-h-6 font-semibold text-stone">
        {current || flash || '\u00a0'}
      </p>

      <div className="mt-4 flex flex-1 items-center">
        <div
          className="grid aspect-square w-full grid-cols-4 gap-2.5 rounded-[22px] bg-[#c9a57a] p-3.5 shadow-[0_8px_20px_rgba(80,50,20,0.12)]"
          onPointerDown={(e) => {
            drawing.current = true
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
            const i = cellFromPoint(e.currentTarget, e.clientX, e.clientY)
            setPath(i !== null ? [i] : [])
            setFlash(null)
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return
            const i = cellFromPoint(e.currentTarget, e.clientX, e.clientY)
            if (i === null) return
            setPath((p) => {
              if (p.includes(i)) {
                if (p.length > 1 && p[p.length - 2] === i) return p.slice(0, -1)
                return p
              }
              const last = p[p.length - 1]
              if (last === undefined) return [i]
              const lr = Math.floor(last / 4)
              const lc = last % 4
              const nr = Math.floor(i / 4)
              const nc = i % 4
              if (Math.abs(lr - nr) <= 1 && Math.abs(lc - nc) <= 1) return [...p, i]
              return p
            })
          }}
          onPointerUp={(e) => {
            drawing.current = false
            commit(pathRef.current)
            setPath([])
            e.currentTarget.releasePointerCapture(e.pointerId)
          }}
        >
          {board.map((letter, i) => (
            <div
              key={i}
              data-cell={i}
              className={`grid place-items-center rounded-2xl font-ui text-[28px] font-bold shadow-[0_1px_0_rgba(0,0,0,0.06)] ${
                path.includes(i) ? 'bg-ink text-[#f3ebe3]' : 'bg-[#fff8f0] text-ink'
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      <p className="type-user mt-4 min-h-10">
        {words.join('  ·  ')}
      </p>

      <button
        type="button"
        className="type-chrome mt-2 h-12 rounded-full bg-ink font-bold text-paper"
        onClick={() => {
          if (finished.current) return
          finished.current = true
          onFinish(words, score)
        }}
      >
        Done
      </button>
    </div>
  )
}
