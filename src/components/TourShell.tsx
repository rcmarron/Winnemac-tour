import { useEffect, useState } from 'react'
import { JournalView } from './JournalView'
import { MapView } from './MapView'
import { NoticeBanner } from './NoticeBanner'
import { useGeolocation } from '../useGeolocation'
import { findNewlyUnlocked } from '../unlock'
import { nextPin, mapPins } from '../mapModel'
import { distanceInMeters } from '../geo'
import type { Progress } from '../storage'
import type { Notice } from '../useProgress'
import type { Stop } from '../types'

type View = 'map' | 'journal'

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
  // The map opens first: the visitor's first question is "where do I walk?"
  const [view, setView] = useState<View>('map')
  const { status, position, accuracy, message, retry } = useGeolocation(true)
  const { unlockedStopIds } = progress

  useEffect(() => {
    if (!position) return
    const newlyUnlocked = findNewlyUnlocked(position, stops, unlockedStopIds)
    if (newlyUnlocked.length > 0) onUnlock(newlyUnlocked)
  }, [position, stops, unlockedStopIds, onUnlock])

  const signposted = stops.filter((stop) => !stop.isMystery)
  const unlockedCount = signposted.filter((stop) => unlockedStopIds.includes(stop.id)).length
  const target = nextPin(mapPins(stops, unlockedStopIds), position)
  const metresToTarget =
    target && position
      ? Math.round(distanceInMeters(position, { latitude: target.latitude, longitude: target.longitude }))
      : null

  return (
    <main className="screen screen--tour">
      <header className="tour__header">
        <h1 className="tour__title">Winnemac Park Tour</h1>
        <p className="tour__count">
          {unlockedCount} of {signposted.length} stops unlocked
        </p>
      </header>

      <nav className="tabs" aria-label="Views">
        <button
          type="button"
          className={`tab ${view === 'map' ? 'tab--active' : ''}`}
          aria-current={view === 'map'}
          onClick={() => setView('map')}
        >
          Map
        </button>
        <button
          type="button"
          className={`tab ${view === 'journal' ? 'tab--active' : ''}`}
          aria-current={view === 'journal'}
          onClick={() => setView('journal')}
        >
          Journal
        </button>
      </nav>

      <div className={`status status--${status}`} role="status">
        {status === 'locating' && <span>Finding you&hellip;</span>}
        {status === 'tracking' && (
          <span>
            {target
              ? `Next: ${target.name}${metresToTarget === null ? '' : ` — ${metresToTarget} m`}`
              : 'Every stop unlocked'}
            {accuracy && accuracy >= 1 ? ` (±${Math.round(accuracy)} m)` : ''}
          </span>
        )}
        {(status === 'denied' || status === 'error' || status === 'unsupported') && (
          <span>{message}</span>
        )}
        {(status === 'denied' || status === 'error') && (
          <button type="button" className="button button--small" onClick={retry}>
            Try again
          </button>
        )}
      </div>

      {view === 'map' ? (
        <MapView stops={stops} unlockedStopIds={unlockedStopIds} position={position} />
      ) : (
        <JournalView
          stops={stops}
          progress={progress}
          position={position}
          onRevealQuiz={onRevealQuiz}
        />
      )}

      {notices.length > 0 && (
        <div className="notices">
          {notices.map((notice) => (
            <NoticeBanner key={notice.key} notice={notice} onDismiss={onDismissNotice} />
          ))}
        </div>
      )}
    </main>
  )
}
