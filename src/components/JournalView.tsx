import { BadgeShelf } from './BadgeShelf'
import { JournalEntry } from './JournalEntry'
import type { Coordinates } from '../geo'
import type { Progress } from '../storage'
import type { Stop } from '../types'

interface JournalViewProps {
  stops: readonly Stop[]
  progress: Progress
  position: Coordinates | null
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
}

export function JournalView({
  stops,
  progress,
  position,
  onRevealQuiz,
  onPlayNarration,
}: JournalViewProps) {
  const { unlockedStopIds, revealedQuizStopIds, earnedBadgeIds } = progress

  return (
    <>
      <BadgeShelf earnedBadgeIds={earnedBadgeIds} />
      <ul className="entries">
        {stops.map((stop) => (
          <JournalEntry
            key={stop.id}
            stop={stop}
            unlocked={unlockedStopIds.includes(stop.id)}
            quizRevealed={revealedQuizStopIds.includes(stop.id)}
            position={position}
            onRevealQuiz={onRevealQuiz}
            onPlayNarration={onPlayNarration}
          />
        ))}
      </ul>
    </>
  )
}
