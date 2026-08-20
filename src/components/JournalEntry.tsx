import { distanceInMeters, type Coordinates } from '../geo'
import type { Stop } from '../types'

interface JournalEntryProps {
  stop: Stop
  unlocked: boolean
  quizRevealed: boolean
  position: Coordinates | null
  onRevealQuiz: (stopId: string) => void
}

function describeDistance(meters: number): string {
  if (meters < 1_000) return `${Math.round(meters)} m away`
  return `${(meters / 1_000).toFixed(1)} km away`
}

export function JournalEntry({
  stop,
  unlocked,
  quizRevealed,
  position,
  onRevealQuiz,
}: JournalEntryProps) {
  const hidden = stop.isMystery && !unlocked
  const distance = position && !hidden ? distanceInMeters(position, stop) : null

  return (
    <li
      className={`entry ${unlocked ? 'entry--unlocked' : 'entry--locked'} ${
        hidden ? 'entry--mystery' : ''
      }`}
    >
      <div className="entry__header">
        <h2 className="entry__name">{hidden ? '???' : stop.name}</h2>
        <span className="entry__badge">
          {unlocked ? (stop.isMystery ? 'Found' : 'Unlocked') : hidden ? 'Undiscovered' : 'Locked'}
        </span>
      </div>

      {unlocked && <p className="entry__text">{stop.text}</p>}

      {unlocked && stop.isMystery && (
        <p className="entry__note">A hidden stop, found off the marked route.</p>
      )}

      {!unlocked && hidden && (
        <p className="entry__hint">{stop.mysteryHint ?? 'Somewhere along the paths.'}</p>
      )}

      {!unlocked && !hidden && (
        <p className="entry__hint">
          Walk here to unlock
          {distance === null ? '' : ` — ${describeDistance(distance)}`}
        </p>
      )}

      {unlocked && stop.quiz && (
        <div className="quiz">
          <p className="quiz__question">{stop.quiz.question}</p>
          {quizRevealed ? (
            <p className="quiz__answer">{stop.quiz.answer}</p>
          ) : (
            <button
              type="button"
              className="button button--small button--quiet"
              onClick={() => onRevealQuiz(stop.id)}
            >
              Reveal answer
            </button>
          )}
        </div>
      )}
    </li>
  )
}
