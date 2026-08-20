import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveMediaUrl } from './media'

export interface Track {
  stopId: string
  name: string
  url: string
}

/**
 * One narration player for the whole tour, so arriving at a stop can start the
 * audio without the journal being open, and nothing ever plays twice at once.
 *
 * Browsers block audio that no gesture asked for. The visitor's tap on "Start"
 * usually counts, but iOS is stricter, so a blocked autoplay is expected: the
 * bar stays up with a play button instead of failing silently.
 */
export function useNarration(baseUrl: string) {
  const element = useRef<HTMLAudioElement | null>(null)
  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)

  // Created lazily so no audio element exists until a stop actually has some.
  const audio = useCallback(() => {
    if (!element.current) {
      const created = new Audio()
      created.preload = 'none'
      created.addEventListener('play', () => setPlaying(true))
      created.addEventListener('pause', () => setPlaying(false))
      created.addEventListener('ended', () => setPlaying(false))
      element.current = created
    }
    return element.current
  }, [])

  useEffect(() => () => element.current?.pause(), [])

  const start = useCallback(
    (next: { stopId: string; name: string; audioUrl: string }) => {
      const player = audio()
      const url = resolveMediaUrl(next.audioUrl, baseUrl)

      if (player.src !== url) player.src = url
      setTrack({ stopId: next.stopId, name: next.name, url })
      setBlocked(false)

      player.play().catch(() => {
        // Autoplay refused: leave the bar up so the visitor can start it.
        setBlocked(true)
        setPlaying(false)
      })
    },
    [audio, baseUrl],
  )

  const toggle = useCallback(() => {
    const player = element.current
    if (!player || !track) return

    if (player.paused) {
      setBlocked(false)
      player.play().catch(() => setBlocked(true))
    } else {
      player.pause()
    }
  }, [track])

  const stop = useCallback(() => {
    element.current?.pause()
    setTrack(null)
    setPlaying(false)
    setBlocked(false)
  }, [])

  return { track, playing, blocked, start, toggle, stop }
}
