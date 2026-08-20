import { HuntPanel } from './HuntPanel'
import { JournalView } from './JournalView'
import { StopDetail } from './StopDetail'
import { describeDistance, nearestStops } from '../nearest'
import type { HuntTrend } from '../hunt'
import type { Coordinates } from '../geo'
import type { Progress } from '../storage'
import type { Stop } from '../types'

/** How many stops the resting sheet shows before "See all". */
const PEEK_COUNT = 3

export type SheetMode = 'list' | 'stop' | 'hunt'

interface StopSheetProps {
  stops: readonly Stop[]
  progress: Progress
  position: Coordinates | null
  mode: SheetMode
  focusedStop: Stop | null
  expanded: boolean
  huntTrend: HuntTrend
  huntDistance: number | null
  onToggleExpanded: () => void
  onFocusStop: (stopId: string) => void
  onBackToList: () => void
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
  onStartHunt: (stopId: string) => void
  onGiveUpHunt: () => void
}

export function StopSheet({
  stops,
  progress,
  position,
  mode,
  focusedStop,
  expanded,
  huntTrend,
  huntDistance,
  onToggleExpanded,
  onFocusStop,
  onBackToList,
  onRevealQuiz,
  onPlayNarration,
  onStartHunt,
  onGiveUpHunt,
}: StopSheetProps) {
  const nearby = nearestStops(stops, progress.unlockedStopIds, position, PEEK_COUNT)
  const showingCard = mode !== 'list' && focusedStop !== null

  const title = expanded
    ? 'All stops'
    : mode === 'hunt'
      ? 'On the hunt'
      : showingCard
        ? focusedStop.isMystery && !progress.unlockedStopIds.includes(focusedStop.id)
          ? 'A hidden stop'
          : focusedStop.name
        : 'Closest to you'

  // An open card already carries its own heading, so repeating the stop's name
  // in the header only crowds Back and See all off their line.
  const headingHidden = showingCard && mode === 'stop' && !expanded

  return (
    <section
      // A card sits taller than the resting list, so it is readable without
      // covering the map entirely.
      className={`sheet ${expanded ? 'sheet--expanded' : showingCard ? 'sheet--tall' : ''}`}
      aria-label={title}
    >
      <header className="sheet__head">
        {showingCard && !expanded ? (
          <button type="button" className="sheet__back" onClick={onBackToList}>
            ‹ Back
          </button>
        ) : null}
        <h2 className={`sheet__title ${headingHidden ? 'visually-hidden' : ''}`}>{title}</h2>
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
        ) : mode === 'hunt' && focusedStop ? (
          <HuntPanel
            hint={focusedStop.mysteryHint ?? 'Somewhere along the paths.'}
            trend={huntTrend}
            distanceMeters={huntDistance}
            onGiveUp={onGiveUpHunt}
          />
        ) : showingCard ? (
          <StopDetail
            stop={focusedStop}
            unlocked={progress.unlockedStopIds.includes(focusedStop.id)}
            quizRevealed={progress.revealedQuizStopIds.includes(focusedStop.id)}
            position={position}
            onRevealQuiz={onRevealQuiz}
            onPlayNarration={onPlayNarration}
            onStartHunt={onStartHunt}
          />
        ) : (
          <ul className="nearby">
            {nearby.map(({ stop, distanceMeters, unlocked }) => (
              <li key={stop.id}>
                {/* The whole row opens the stop: arriving somewhere and having
                    nothing to tap is the failure this fixes. */}
                <button
                  type="button"
                  className={`nearby__row ${unlocked ? 'nearby__row--unlocked' : ''}`}
                  onClick={() => onFocusStop(stop.id)}
                >
                  <span className="nearby__name">
                    {stop.name}
                    {unlocked && <span className="nearby__tag">Unlocked</span>}
                  </span>
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
