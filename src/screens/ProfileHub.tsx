import { Link, useNavigate } from 'react-router-dom'
import { CapsuleButton } from '../components/CapsuleButton'
import { GamesCard } from '../components/GamesCard'
import { GrainPhoto } from '../components/GrainPhoto'
import { useAppStore } from '../store/appStore'

export function ProfileHub() {
  const you = useAppStore((s) => s.currentUser)
  const roses = useAppStore((s) => s.roses)
  const prefs = useAppStore((s) => s.preferences)
  const resetToDemoAlex = useAppStore((s) => s.resetToDemoAlex)
  const navigate = useNavigate()
  const hero = you.photos[0]

  return (
    <div className="scrollbar-hide h-full overflow-y-auto bg-canvas px-5 pt-2 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="type-title">You</h1>
        <Link to="/you/edit" className="type-chrome rounded-full bg-pebble px-4 py-2 font-semibold">
          Edit
        </Link>
      </div>

      <Link
        to="/you/preview"
        className="mt-5 block overflow-hidden rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]"
      >
        {hero ? (
          <GrainPhoto src={hero.url} alt="" className="aspect-[4/5] w-full" />
        ) : (
          <div className="type-chrome grid aspect-[4/5] place-items-center bg-pebble text-stone">
            Photos
          </div>
        )}
        <div className="bg-paper px-5 py-4">
          <p className="type-title">
            {you.name || 'You'}, {you.age || '—'}
          </p>
        </div>
      </Link>

      <div className="mt-5">
        <GamesCard
          games={you.games}
          onLikeGame={() => navigate('/you/edit?step=3')}
          onEmptyAction={() => navigate('/you/edit?step=3')}
        />
      </div>

      <Link
        to="/you/dates"
        className="mt-5 block rounded-[24px] bg-paper px-5 py-4 shadow-[0_2px_10px_rgba(26,26,26,0.06)]"
      >
        <p className="type-title">Dates</p>
      </Link>

      <dl className="mt-6 divide-y divide-pebble rounded-[24px] bg-paper px-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
        <Row label="Roses" value={`${roses}`} />
        <Row label="Age" value={`${prefs.ageMin}–${prefs.ageMax}`} />
        <Row label="Invites" value={you.acceptChallenges ? 'On' : 'Off'} />
      </dl>

      <div className="mt-6 flex flex-col gap-2">
        <Link to="/you/create">
          <CapsuleButton>Create</CapsuleButton>
        </Link>
        <CapsuleButton variant="soft" onClick={resetToDemoAlex}>
          Demo
        </CapsuleButton>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3.5">
      <dt className="type-chrome text-stone">{label}</dt>
      <dd className="type-chrome text-right font-medium capitalize">{value}</dd>
    </div>
  )
}
