import type { Photo } from '../types'
import { GrainPhoto } from './GrainPhoto'
import { HeartButton } from './HeartButton'
import { VideoFrame } from './VideoFrame'

interface Props {
  photo: Photo
  onLike?: () => void
}

export function PhotoCard({ photo, onLike }: Props) {
  const video = photo.kind === 'video' && photo.videoUrl

  return (
    <article className="relative overflow-hidden rounded-[24px] bg-paper shadow-[0_2px_10px_rgba(26,26,26,0.06)]">
      {video ? (
        <VideoFrame
          src={photo.videoUrl!}
          poster={photo.url}
          alt={photo.alt}
          className="aspect-[4/5] w-full"
        />
      ) : (
        <GrainPhoto src={photo.url} alt={photo.alt} className="aspect-[4/5] w-full" />
      )}
      <p className="type-chrome px-5 py-3 font-semibold tracking-[0.14em] text-stone uppercase">
        {video ? 'Video' : 'Photo'}
      </p>
      {onLike && <HeartButton onClick={onLike} className="absolute top-3 right-3" />}
    </article>
  )
}
