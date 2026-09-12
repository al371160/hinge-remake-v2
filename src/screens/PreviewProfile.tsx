import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ProfileStack } from '../components/ProfileStack'
import { useAppStore } from '../store/appStore'

export function PreviewProfile() {
  const you = useAppStore((s) => s.currentUser)
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-1 px-2 pt-1 pb-2">
        <Link to="/you" className="grid h-10 w-10 place-items-center" aria-label="Back">
          <ChevronLeft />
        </Link>
        <p className="type-title">{you.name || 'You'}</p>
      </header>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4">
        <ProfileStack profile={you} onEmptyGames={() => navigate('/you/edit?step=3')} />
      </div>
    </div>
  )
}
