import { useCallback, useEffect, useRef, useState } from 'react'
import { MapView } from './MapView'
import { NarrationBar } from './NarrationBar'
import { NoticeBanner } from './NoticeBanner'
import { StopSheet } from './StopSheet'
import { useGeolocation } from '../useGeolocation'
import { useNarration } from '../useNarration'
import { findNewlyUnlocked } from '../unlock'
import type { Progress } from '../storage'
import type { Notice } from '../useProgress'
import type { Stop } from '../types'

interface TourShellProps {
  stops: readonly Stop[]
  progress: Progress
  notices: readonly Notice[]
  onUnlock: (stopIds: readonly string[]) => void
  onRevealQuiz: (stopId: string) => void
  onDismissNotice: (key: string) => void
}

export function TourShell({
  stops,
  progress,
  notices,
  onUnlock,
  onRevealQuiz,
  onDismissNotice,
}: TourShellProps) {
  const [expanded, setExpanded] = useState(false)
  const { status, position, accuracy, message, retry } = useGeolocation(true)
  const narration = useNarration(import.meta.env.BASE_URL)
  const { unlockedStopIds } = progress

  const playNarration = useCallback(
    (stop: Stop) => {
      if (!stop.audioUrl) return
      narration.start({ stopId: stop.id, name: stop.name, audioUrl: stop.audioUrl })
    },
    [narration],
  )

  // Narration starts on arrival, where a stop has any: the visitor should be
  // able to pocket the phone and listen. Announced arrivals are tracked so a
  // re-render never restarts a track.
  const announced = useRef(new Set<string>())
  useEffect(() => {
    for (const notice of notices) {
      if (notice.kind !== 'stop' || !notice.stopId) continue
      if (announced.current.has(notice.stopId)) continue

      announced.current.add(notice.stopId)
      const arrived = stops.find((stop) => stop.id === notice.stopId)
      if (arrived?.audioUrl) playNarration(arrived)
    }
  }, [notices, stops, playNarration])

  useEffect(() => {
    if (!position) return
    const newlyUnlocked = findNewlyUnlocked(position, stops, unlockedStopIds)
    if (newlyUnlocked.length > 0) onUnlock(newlyUnlocked)
  }, [position, stops, unlockedStopIds, onUnlock])

  const signposted = stops.filter((stop) => !stop.isMystery)
  const unlockedCount = signposted.filter((stop) => unlockedStopIds.includes(stop.id)).length

  return (
    <main className="tour">
      <header className="tour__bar">
        <div>
          <h1 className="tour__title">Winnemac Park Tour</h1>
          <p className="tour__count">
            {unlockedCount} of {signposted.length} stops unlocked
          </p>
        </div>
        <p className={`fix fix--${status}`}>
          {status === 'locating' && 'Finding you…'}
          {status === 'tracking' &&
            (accuracy && accuracy >= 1 ? `±${Math.round(accuracy)} m` : 'Following along')}
          {(status === 'denied' || status === 'error' || status === 'unsupported') && (
            <>
              <span className="fix__message">{message}</span>
              {(status === 'denied' || status === 'error') && (
                <button type="button" className="button button--small" onClick={retry}>
                  Try again
                </button>
              )}
            </>
          )}
        </p>
      </header>

      <div className="tour__stage">
        <div className="tour__map">
          <MapView stops={stops} unlockedStopIds={unlockedStopIds} position={position} />
        </div>

        <StopSheet
          stops={stops}
          progress={progress}
          position={position}
          expanded={expanded}
          onToggle={() => setExpanded((open) => !open)}
          onRevealQuiz={onRevealQuiz}
          onPlayNarration={playNarration}
        />
      </div>

      {narration.track && (
        <NarrationBar
          track={narration.track}
          playing={narration.playing}
          blocked={narration.blocked}
          onToggle={narration.toggle}
          onStop={narration.stop}
        />
      )}

      {notices.length > 0 && (
        <div className={`notices ${narration.track ? 'notices--above-narration' : ''}`}>
          {notices.map((notice) => (
            <NoticeBanner key={notice.key} notice={notice} onDismiss={onDismissNotice} />
          ))}
        </div>
      )}
    </main>
  )
}
