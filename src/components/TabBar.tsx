import { Heart, MessageCircle, Sparkle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import { useAppStore } from '../store/appStore'

const tabs = [
  { to: '/', label: 'Discover', icon: 'h' as const },
  { to: '/standouts', label: 'Standouts', icon: 'star' as const },
  { to: '/likes', label: 'Likes', icon: 'heart' as const },
  { to: '/matches', label: 'Matches', icon: 'chat' as const },
  { to: '/you', label: 'You', icon: 'you' as const },
]

export function TabBar() {
  const likeCount = useAppStore((s) => s.incomingLikes.length)
  const you = useAppStore((s) => s.currentUser)

  return (
    <nav className="grid h-[62px] grid-cols-5 bg-ink pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            cn(
              'relative flex flex-col items-center justify-center gap-0.5 font-ui text-[10px] font-medium',
              isActive ? 'text-paper' : 'text-paper/40',
            )
          }
        >
          {({ isActive }) => (
            <>
              {tab.icon === 'h' && (
                <span className="font-ui text-[22px] leading-none font-bold">H</span>
              )}
              {tab.icon === 'star' && (
                <Sparkle className={cn('h-5 w-5', isActive && 'fill-paper')} />
              )}
              {tab.icon === 'heart' && (
                <span className="relative">
                  <Heart className={cn('h-5 w-5', isActive && 'fill-paper')} />
                  {likeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 font-ui text-[9px] font-bold text-paper">
                      {likeCount}
                    </span>
                  )}
                </span>
              )}
              {tab.icon === 'chat' && (
                <MessageCircle className={cn('h-5 w-5', isActive && 'fill-paper')} />
              )}
              {tab.icon === 'you' && (
                <span className="relative grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-stone">
                  {you.photos[0] ? (
                    <img src={you.photos[0].url} alt="" className="grain-img h-full w-full object-cover" />
                  ) : (
                    <span className="font-ui text-[10px] font-bold text-paper">You</span>
                  )}
                </span>
              )}
              <span>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
