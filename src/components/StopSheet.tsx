import { JournalView } from './JournalView'
import { describeDistance, nearestStops } from '../nearest'
import type { Coordinates } from '../geo'
import type { Progress } from '../storage'
import type { Stop } from '../types'

/** How many stops the resting sheet shows before "See all". */
const PEEK_COUNT = 3

interface StopSheetProps {
  stops: readonly Stop[]
  progress: Progress
  position: Coordinates | null
  expanded: boolean
  onToggleExpanded: () => void
  onOpenStop: (stopId: string) => void
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
  onStartHunt: (stopId: string) => void
}

/**
 * The sheet under the map: the closest stops at rest, the whole journal when
 * expanded. A single stop's content opens in a modal instead, so reading it
 * never depends on how far the sheet happens to be pulled up.
 */
export function StopSheet({
  stops,
  progress,
  position,
  expanded,
  onToggleExpanded,
  onOpenStop,
  onRevealQuiz,
  onPlayNarration,
  onStartHunt,
}: StopSheetProps) {
  const nearby = nearestStops(stops, progress.unlockedStopIds, position, PEEK_COUNT)

  return (
    <section className={`sheet ${expanded ? 'sheet--expanded' : ''}`} aria-label="Stops">
      <header className="sheet__head">
        <h2 className="sheet__title">{expanded ? 'All stops' : 'Closest to you'}</h2>
        <button
          type="button"
          className="button button--small button--quiet"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
        >
          {expanded ? 'Show map' : 'See all'}
        </button>
      </header>

      <div className="sheet__body">
        {expanded ? (
          <JournalView
            stops={stops}
            progress={progress}
            position={position}
            onRevealQuiz={onRevealQuiz}
            onPlayNarration={onPlayNarration}
            onStartHunt={onStartHunt}
          />
        ) : (
          <ul className="nearby">
            {nearby.map(({ stop, distanceMeters, unlocked }) => (
              <li key={stop.id}>
                <button
                  type="button"
                  className={`nearby__row ${unlocked ? 'nearby__row--unlocked' : ''}`}
                  onClick={() => onOpenStop(stop.id)}
                >
                  <span className="nearby__name">
                    {stop.name}
                    {unlocked && <span className="nearby__tag">Unlocked</span>}
                  </span>
                  {/* Distance stays visible once unlocked: revisiting is part of
                      the tour, so "how far back is it?" is still a real question. */}
                  <span className="nearby__meta">
                    {describeDistance(distanceMeters)}
                    <span className="nearby__chevron" aria-hidden="true">
                      ›
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {nearby.length === 0 && <li className="nearby__empty">No stops to show yet.</li>}
          </ul>
        )}
      </div>
    </section>
  )
}
