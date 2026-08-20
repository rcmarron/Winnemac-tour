import { BadgeShelf } from './BadgeShelf'
import { JournalEntry } from './JournalEntry'
import { SupportPanel } from './SupportPanel'
import { showSupportInvitation } from '../donation'
import type { Coordinates } from '../geo'
import type { Progress } from '../storage'
import type { Stop } from '../types'

interface JournalViewProps {
  stops: readonly Stop[]
  progress: Progress
  position: Coordinates | null
  onRevealQuiz: (stopId: string) => void
  onPlayNarration: (stop: Stop) => void
  onStartHunt: (stopId: string) => void
}

export function JournalView({
  stops,
  progress,
  position,
  onRevealQuiz,
  onPlayNarration,
  onStartHunt,
}: JournalViewProps) {
  const { unlockedStopIds, revealedQuizStopIds, earnedBadgeIds } = progress

  return (
    <>
      {showSupportInvitation(earnedBadgeIds) && <SupportPanel />}
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
            onStartHunt={onStartHunt}
          />
        ))}
      </ul>
    </>
  )
}
