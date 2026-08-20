import { youTubeEmbedUrl } from '../media'

interface VideoEmbedProps {
  url: string
  stopName: string
}

/**
 * A short clip on a stop. Only links we recognise are embedded; anything else
 * becomes a plain link rather than a broken player.
 */
export function VideoEmbed({ url, stopName }: VideoEmbedProps) {
  const embed = youTubeEmbedUrl(url)

  if (!embed) {
    return (
      <p className="video video--link">
        <a href={url} target="_blank" rel="noreferrer">
          Watch the clip for {stopName}
        </a>
      </p>
    )
  }

  return (
    <div className="video">
      <iframe
        src={embed}
        title={`Video: ${stopName}`}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
