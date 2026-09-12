import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CapsuleButton } from '../components/CapsuleButton'
import { GameTile } from '../components/GameTile'
import { GrainPhoto } from '../components/GrainPhoto'
import { emptyUser } from '../data/emptyUser'
import { GAME_IDS, GAME_META, VIBE_LABEL } from '../data/games'
import { inferPromptCategory, PROMPT_CATEGORY_META, PROMPTS_BY_CATEGORY } from '../data/promptBank'
import { HEIGHTS, INTENTIONS, STOCK_PHOTOS } from '../data/studio'
import { uid } from '../lib/id'
import { useAppStore } from '../store/appStore'
import type { GameId, GamePreference, GameVibe, Photo, Profile, Prompt, PromptCategory } from '../types'

const STEPS = ['You', 'Photos', 'Prompts', 'Games', 'Vitals'] as const

export function ProfileStudio({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const you = useAppStore((s) => s.currentUser)
  const commitProfile = useAppStore((s) => s.commitProfile)
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser)
  const updateGames = useAppStore((s) => s.updateGames)

  const startStep = Math.min(4, Math.max(0, Number(params.get('step') ?? 0) || 0))
  const [step, setStep] = useState(mode === 'edit' ? startStep : 0)
  const [draft, setDraft] = useState<Profile>(() =>
    mode === 'create' ? structuredClone(emptyUser) : you,
  )
  const [library, setLibrary] = useState(false)

  const profile = mode === 'create' ? draft : you

  const patch = (next: Partial<Profile>) => {
    if (mode === 'create') setDraft((d) => ({ ...d, ...next }))
    else updateCurrentUser(next)
  }

  const setGames = (games: GamePreference[]) => {
    if (mode === 'create') setDraft((d) => ({ ...d, games }))
    else updateGames(games)
  }

  const canContinue = useMemo(() => {
    if (step === 0) return profile.name.trim().length > 1 && profile.location.trim().length > 1
    if (step === 1) return profile.photos.length >= 2
    if (step === 2)
      return profile.prompts.length === 3 && profile.prompts.every((p) => p.answer.trim().length > 8)
    if (step === 3) return profile.games.length >= 1
    return true
  }, [step, profile])

  const finish = () => {
    if (mode === 'create') commitProfile({ ...draft, vitals: { ...draft.vitals, location: draft.location } })
    navigate('/you/preview')
  }

  const next = () => {
    if (step === 4) finish()
    else setStep((s) => s + 1)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-1 px-2 pt-1 pb-2">
        {step === 0 ? (
          <Link to="/you" className="grid h-10 w-10 place-items-center" aria-label="Back">
            <ChevronLeft />
          </Link>
        ) : (
          <button
            type="button"
            className="grid h-10 w-10 place-items-center"
            onClick={() => setStep((s) => s - 1)}
            aria-label="Back"
          >
            <ChevronLeft />
          </button>
        )}
        <h1 className="type-title">
          {mode === 'create' ? 'Create' : 'Edit'}
        </h1>
      </header>

      <div className="flex gap-1 px-5">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (mode === 'edit' || i <= step) setStep(i)
            }}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-ink' : 'bg-pebble'}`}
            aria-label={label}
          />
        ))}
      </div>
      <p className="type-chrome px-5 pt-2 font-semibold tracking-[0.12em] text-stone uppercase">
        {STEPS[step]}
      </p>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-4">
        {step === 0 && <YouStep profile={profile} patch={patch} />}
        {step === 1 && (
          <PhotosStep
            profile={profile}
            patch={patch}
            library={library}
            setLibrary={setLibrary}
          />
        )}
        {step === 2 && <PromptsStep profile={profile} patch={patch} />}
        {step === 3 && <GamesStep profile={profile} setGames={setGames} />}
        {step === 4 && <VitalsStep profile={profile} patch={patch} />}
      </div>

      <div className="px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
        <CapsuleButton onClick={next} disabled={!canContinue}>
          {step === 4 ? 'Save' : 'Continue'}
        </CapsuleButton>
      </div>
    </div>
  )
}

function YouStep({
  profile,
  patch,
}: {
  profile: Profile
  patch: (p: Partial<Profile>) => void
}) {
  return (
    <div className="space-y-3">
      <Field label="Name">
        <input
          value={profile.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="field"
          placeholder="First name"
        />
      </Field>
      <Field label="Age">
        <input
          type="number"
          min={18}
          max={99}
          value={profile.age}
          onChange={(e) => patch({ age: Number(e.target.value) || 18 })}
          className="field"
        />
      </Field>
      <Field label="Pronouns">
        <input
          value={profile.pronouns ?? ''}
          onChange={(e) => patch({ pronouns: e.target.value })}
          className="field"
          placeholder="she/her"
        />
      </Field>
      <Field label="Location">
        <input
          value={profile.location}
          onChange={(e) =>
            patch({ location: e.target.value, vitals: { ...profile.vitals, location: e.target.value } })
          }
          className="field"
          placeholder="Neighborhood"
        />
      </Field>
      <label className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
        <span className="type-chrome font-semibold">Verified</span>
        <input
          type="checkbox"
          checked={profile.verified}
          onChange={(e) => patch({ verified: e.target.checked })}
          className="h-5 w-5 accent-[#994ea8]"
        />
      </label>
      <label className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3">
        <span className="type-chrome font-semibold">New</span>
        <input
          type="checkbox"
          checked={Boolean(profile.newHere)}
          onChange={(e) => patch({ newHere: e.target.checked })}
          className="h-5 w-5 accent-[#994ea8]"
        />
      </label>
    </div>
  )
}

function PhotosStep({
  profile,
  patch,
  library,
  setLibrary,
}: {
  profile: Profile
  patch: (p: Partial<Profile>) => void
  library: boolean
  setLibrary: (v: boolean) => void
}) {
  const addPhoto = (photo: Photo) => {
    if (profile.photos.length >= 6) return
    if (profile.photos.some((p) => p.url === photo.url)) return
    patch({ photos: [...profile.photos, { ...photo, id: uid('photo') }] })
    setLibrary(false)
  }

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      addPhoto({ id: uid('photo'), url: String(reader.result), alt: file.name })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => {
          const photo = profile.photos[i]
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (photo) {
                  patch({ photos: profile.photos.filter((p) => p.id !== photo.id) })
                } else setLibrary(true)
              }}
              className="aspect-[4/5] overflow-hidden rounded-xl bg-pebble"
            >
              {photo ? (
                <GrainPhoto src={photo.url} alt="" className="h-full w-full" />
              ) : (
                <span className="type-chrome grid h-full place-items-center text-stone">
                  Add
                </span>
              )}
            </button>
          )
        })}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Upload a photo</span>
        <input
          type="file"
          accept="image/*"
          className="type-chrome block w-full text-stone"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
          }}
        />
      </label>

      {library && (
        <div className="mt-4">
          <p className="type-chrome font-semibold tracking-wide text-stone uppercase">
            Photos
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {STOCK_PHOTOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addPhoto(p)}
                className="overflow-hidden rounded-xl"
              >
                <GrainPhoto src={p.url} alt={p.alt} className="aspect-[4/5] w-full" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PromptsStep({
  profile,
  patch,
}: {
  profile: Profile
  patch: (p: Partial<Profile>) => void
}) {
  const [category, setCategory] = useState<PromptCategory>('aboutMe')
  const used = new Set(profile.prompts.map((p) => p.question))
  const add = (question: string) => {
    if (profile.prompts.length >= 3 || used.has(question)) return
    patch({
      prompts: [
        ...profile.prompts,
        { id: uid('pr'), question, answer: '', category: inferPromptCategory(question) },
      ],
    })
  }
  const update = (i: number, next: Partial<Prompt>) => {
    patch({
      prompts: profile.prompts.map((p, idx) => (idx === i ? { ...p, ...next } : p)),
    })
  }

  return (
    <div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {PROMPT_CATEGORY_META.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`type-chrome shrink-0 rounded-full px-3 py-1.5 font-semibold ${
              category === c.id ? 'bg-ink text-paper' : 'bg-pebble text-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {PROMPTS_BY_CATEGORY[category].map((q) => (
          <button
            key={q}
            type="button"
            disabled={used.has(q) || profile.prompts.length >= 3}
            onClick={() => add(q)}
            className="type-chrome rounded-full bg-paper px-3 py-1.5 font-medium disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
      <div className="rounded-2xl bg-paper p-4">
        <p className="type-chrome font-semibold tracking-[0.12em] text-stone uppercase">
          Voice
        </p>
        <input
          className="field mt-2"
          placeholder="How to pronounce my name"
          value={profile.voicePrompt?.question ?? ''}
          onChange={(e) =>
            patch({
              voicePrompt: {
                id: profile.voicePrompt?.id ?? uid('voice'),
                question: e.target.value,
                spoken: profile.voicePrompt?.spoken ?? '',
                durationSec: profile.voicePrompt?.durationSec ?? 10,
                category: 'voiceFirst',
              },
            })
          }
        />
        <textarea
          className="type-user mt-2 w-full resize-none rounded-2xl bg-pebble px-4 py-3 outline-none placeholder:font-ui placeholder:text-[13px]"
          rows={2}
          placeholder="Spoken"
          value={profile.voicePrompt?.spoken ?? ''}
          onChange={(e) =>
            patch({
              voicePrompt: {
                id: profile.voicePrompt?.id ?? uid('voice'),
                question: profile.voicePrompt?.question ?? 'How to pronounce my name',
                spoken: e.target.value,
                durationSec: 10,
                category: 'voiceFirst',
              },
            })
          }
        />
      </div>

        {profile.prompts.map((p, i) => (
          <label key={p.id} className="block rounded-2xl bg-paper p-4 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
            <span className="type-chrome text-stone">{p.question}</span>
            <textarea
              value={p.answer}
              rows={3}
              onChange={(e) => update(i, { answer: e.target.value })}
              className="type-user mt-2 w-full resize-none bg-transparent outline-none"
              placeholder="Answer"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function GamesStep({
  profile,
  setGames,
}: {
  profile: Profile
  setGames: (g: GamePreference[]) => void
}) {
  const toggle = (gameId: GameId) => {
    const exists = profile.games.find((g) => g.gameId === gameId)
    if (exists) {
      const next = profile.games.filter((g) => g.gameId !== gameId)
      if (exists.favorite && next[0]) next[0] = { ...next[0], favorite: true }
      setGames(next)
      return
    }
    if (profile.games.length >= 4) return
    setGames([
      ...profile.games,
      {
        gameId,
        favorite: profile.games.length === 0,
        vibe: 'forFun',
        oneLiner: '',
      },
    ])
  }
  const patchGame = (gameId: GameId, next: Partial<GamePreference>) => {
    setGames(
      profile.games.map((g) => {
        if (next.favorite && g.gameId !== gameId) return { ...g, favorite: false }
        if (g.gameId !== gameId) return g
        return { ...g, ...next }
      }),
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        {GAME_IDS.map((id) => {
          const on = profile.games.some((g) => g.gameId === id)
          return (
            <button key={id} type="button" onClick={() => toggle(id)} className="text-left">
              <GameTile gameId={id} selected={on} />
              <p className="type-chrome mt-1.5 font-semibold">{GAME_META[id].short}</p>
            </button>
          )
        })}
      </div>
      <div className="mt-4 space-y-3">
        {profile.games.filter((g) => g.gameId in GAME_META).map((g) => (
          <div key={g.gameId} className="rounded-2xl bg-paper p-4 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
            <div className="flex items-center justify-between">
              <p className="font-ui text-[16px] font-semibold">{GAME_META[g.gameId].name}</p>
              <button
                type="button"
                onClick={() => patchGame(g.gameId, { favorite: true })}
                className="type-chrome font-semibold text-kohlrabi"
              >
                {g.favorite ? '★' : 'Star'}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(VIBE_LABEL) as GameVibe[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => patchGame(g.gameId, { vibe: v })}
                  className={`type-chrome rounded-full px-3 py-1 font-medium ${
                    g.vibe === v ? 'bg-ink text-paper' : 'bg-pebble text-ink'
                  }`}
                >
                  {VIBE_LABEL[v]}
                </button>
              ))}
            </div>
            <input
              value={g.oneLiner}
              maxLength={40}
              placeholder="One-liner"
              onChange={(e) => patchGame(g.gameId, { oneLiner: e.target.value })}
              className="field type-user mt-3 placeholder:font-ui placeholder:text-[13px]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function VitalsStep({
  profile,
  patch,
}: {
  profile: Profile
  patch: (p: Partial<Profile>) => void
}) {
  const v = profile.vitals
  return (
    <div className="space-y-3">
      <Field label="Job">
        <input
          className="field"
          value={v.job ?? ''}
          onChange={(e) => patch({ vitals: { ...v, job: e.target.value } })}
        />
      </Field>
      <Field label="Education">
        <input
          className="field"
          value={v.education ?? ''}
          onChange={(e) => patch({ vitals: { ...v, education: e.target.value } })}
        />
      </Field>
      <Field label="Hometown">
        <input
          className="field"
          value={v.hometown ?? ''}
          onChange={(e) => patch({ vitals: { ...v, hometown: e.target.value } })}
        />
      </Field>
      <Field label="Height">
        <select
          className="field"
          value={v.height ?? ''}
          onChange={(e) => patch({ vitals: { ...v, height: e.target.value } })}
        >
          <option value="">Prefer not to say</option>
          {HEIGHTS.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </Field>
      <Field label="Dating intentions">
        <select
          className="field"
          value={v.intentions ?? ''}
          onChange={(e) => patch({ vitals: { ...v, intentions: e.target.value } })}
        >
          <option value="">Prefer not to say</option>
          {INTENTIONS.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </Field>
      <label className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
        <span className="type-chrome">Invites</span>
        <input
          type="checkbox"
          checked={profile.acceptChallenges}
          onChange={(e) => patch({ acceptChallenges: e.target.checked })}
          className="h-5 w-5 accent-[#994ea8]"
        />
      </label>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="type-chrome font-semibold tracking-wide text-stone uppercase">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
