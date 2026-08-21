import { VideoEmbed } from './VideoEmbed'
import { describeDistance } from '../nearest'
import { distanceInMeters, type Coordinates } from '../geo'
import type { Stop } from '../types'

interface StopDetailProps {
  stop: Stop
  unlocked: boolean
  quizRevealed: boolean
  /** True when this stop's narration is the one currently playing. */
  narrationPlaying?: boolean
  position: Coordinates | null
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
  onStartHunt: (stopId: string) => void
}

/**
 * One stop, opened. This is what arriving pops up, and what tapping a row in
 * the closest list opens -- so the content is one tap away rather than behind
 * the full journal.
 */
export function StopDetail({
  stop,
  unlocked,
  quizRevealed,
  narrationPlaying = false,
  position,
  onRevealQuiz,
  onPlayNarration,
  onStartHunt,
}: StopDetailProps) {
  const hidden = stop.isMystery && !unlocked
  const distance = position && !hidden ? distanceInMeters(position, stop) : null

  return (
    <article className="detail">
      <h3 className="detail__name">{hidden ? '???' : stop.name}</h3>

      <p className="detail__status">
        {unlocked
          ? stop.isMystery
            ? 'Found — a hidden stop, off the marked route'
            : 'Unlocked'
          : hidden
            ? 'Undiscovered'
            : `Walk here to unlock — ${describeDistance(distance)}`}
      </p>

      {unlocked && <p className="detail__text">{stop.text}</p>}

      {!unlocked && hidden && (
        <>
          <p className="detail__hint">{stop.mysteryHint ?? 'Somewhere along the paths.'}</p>
          <button type="button" className="button" onClick={() => onStartHunt(stop.id)}>
            Hunt for it
          </button>
        </>
      )}

      {!unlocked && !hidden && (
        <p className="detail__hint">
          Its story unlocks when you arrive. Walking there is how you earn it.
        </p>
      )}

      {unlocked && stop.audioUrl && (
        <p className="detail__media">
          <button
            type="button"
            className="button button--small button--quiet"
            onClick={() => onPlayNarration(stop)}
          >
            {narrationPlaying ? 'Pause narration' : 'Play narration'}
          </button>
        </p>
      )}

      {unlocked && stop.videoUrl && <VideoEmbed url={stop.videoUrl} stopName={stop.name} />}

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
    </article>
  )
}
