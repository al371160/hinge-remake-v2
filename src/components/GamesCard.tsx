import { GAME_IDS, gameMeta, isGameId } from '../data/games'
import { cn } from '../lib/cn'
import type { GamePreference } from '../types'
import { GameTile } from './GameTile'
import { HeartButton } from './HeartButton'

interface Props {
  games: GamePreference[]
  onLikeGame?: (game: GamePreference) => void
  onLikeCard?: () => void
  onEmptyAction?: () => void
}

export function GamesCard({ games, onLikeGame, onLikeCard, onEmptyAction }: Props) {
  const known = games.filter((g) => isGameId(g.gameId))
  const favorite = known.find((g) => g.favorite) ?? known[0]
  const tiles = known.length ? known : GAME_IDS.map((gameId) => ({ gameId }))

  return (
    <article className="rounded-[24px] bg-paper px-5 py-5 shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <p className="type-chrome font-semibold tracking-[0.14em] text-stone uppercase">Game</p>
        {onLikeCard && known.length > 0 && (
          <HeartButton onClick={onLikeCard} label="Like their games" />
        )}
      </div>

      <div className={cn('mt-4 grid gap-2.5', tiles.length >= 4 ? 'grid-cols-2' : 'grid-cols-3')}>
        {tiles.map((g) => (
          <button
            key={g.gameId}
            type="button"
            onClick={() => {
              if (!known.length) {
                onEmptyAction?.()
                return
              }
              const pref = games.find((x) => x.gameId === g.gameId)
              if (pref) onLikeGame?.(pref)
            }}
            className="text-left"
          >
            <GameTile
              gameId={g.gameId}
              selected={Boolean(favorite && favorite.gameId === g.gameId)}
            />
            <p className="type-chrome mt-1.5 truncate font-semibold text-ink">
              {gameMeta(g.gameId).short}
            </p>
          </button>
        ))}
      </div>

      {favorite ? (
        <button type="button" onClick={() => onLikeGame?.(favorite)} className="mt-4 w-full text-left">
          {favorite.oneLiner && <p className="type-user">“{favorite.oneLiner}”</p>}
        </button>
      ) : (
        <p className="type-chrome mt-4 text-stone">Add a game</p>
      )}
    </article>
  )
}
