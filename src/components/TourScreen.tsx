import { useEffect } from 'react'
import { StopCard } from './StopCard'
import { useGeolocation } from '../useGeolocation'
import { findNewlyUnlocked, visibleStops } from '../unlock'
import type { Stop } from '../types'

interface TourScreenProps {
  stops: readonly Stop[]
  unlockedStopIds: readonly string[]
  onUnlock: (stopIds: readonly string[]) => void
}

export function TourScreen({ stops, unlockedStopIds, onUnlock }: TourScreenProps) {
  const { status, position, accuracy, message, retry } = useGeolocation(true)

  useEffect(() => {
    if (!position) return
    const newlyUnlocked = findNewlyUnlocked(position, stops, unlockedStopIds)
    if (newlyUnlocked.length > 0) onUnlock(newlyUnlocked)
  }, [position, stops, unlockedStopIds, onUnlock])

  const listed = visibleStops(stops, unlockedStopIds)
  const signposted = stops.filter((stop) => !stop.isMystery).length
  const unlockedSignposted = stops.filter(
    (stop) => !stop.isMystery && unlockedStopIds.includes(stop.id),
  ).length

  return (
    <main className="screen">
      <header className="tour__header">
        <h1 className="tour__title">Winnemac Park Tour</h1>
        <p className="tour__count">
          {unlockedSignposted} of {signposted} stops unlocked
        </p>
      </header>

      <div className={`status status--${status}`} role="status">
        {status === 'locating' && <span>Finding you&hellip;</span>}
        {status === 'tracking' && (
          <span>
            Following along
            {accuracy && accuracy >= 1 ? ` \u2014 accurate to about ${Math.round(accuracy)} m` : ''}
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

      <ul className="stops">
        {listed.map((stop) => (
          <StopCard
            key={stop.id}
            stop={stop}
            unlocked={unlockedStopIds.includes(stop.id)}
            position={position}
          />
        ))}
      </ul>
    </main>
  )
}
