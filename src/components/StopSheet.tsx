import { JournalView } from './JournalView'
import { describeDistance, nearestStops } from '../nearest'
import type { Coordinates } from '../geo'
import type { Progress } from '../storage'
import type { Stop } from '../types'

/** How many stops the collapsed sheet shows before "See all". */
const PEEK_COUNT = 3

interface StopSheetProps {
  stops: readonly Stop[]
  progress: Progress
  position: Coordinates | null
  expanded: boolean
  onToggle: () => void
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
}

export function StopSheet({
  stops,
  progress,
  position,
  expanded,
  onToggle,
  onRevealQuiz,
  onPlayNarration,
}: StopSheetProps) {
  const nearby = nearestStops(stops, progress.unlockedStopIds, position, PEEK_COUNT)

  return (
    <section
      className={`sheet ${expanded ? 'sheet--expanded' : ''}`}
      aria-label={expanded ? 'All stops' : 'Nearest stops'}
    >
      <header className="sheet__head">
        <h2 className="sheet__title">{expanded ? 'All stops' : 'Closest to you'}</h2>
        <button
          type="button"
          className="button button--small button--quiet"
          onClick={onToggle}
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
          />
        ) : (
          <ul className="nearby">
            {nearby.map(({ stop, distanceMeters, unlocked }) => (
              <li key={stop.id} className={`nearby__row ${unlocked ? 'nearby__row--unlocked' : ''}`}>
                <span className="nearby__name">
                  {stop.name}
                  {unlocked && <span className="nearby__tag">Unlocked</span>}
                </span>
                {/* Distance stays visible once unlocked: revisiting is part of
                    the tour, so "how far back is it?" is still a real question. */}
                <span className="nearby__meta">{describeDistance(distanceMeters)}</span>
              </li>
            ))}
            {nearby.length === 0 && <li className="nearby__row">No stops to show yet.</li>}
          </ul>
        )}
      </div>
    </section>
  )
}
