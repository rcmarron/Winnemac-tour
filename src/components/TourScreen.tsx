import { useEffect } from 'react'
import { BadgeShelf } from './BadgeShelf'
import { JournalEntry } from './JournalEntry'
import { NoticeBanner } from './NoticeBanner'
import { useGeolocation } from '../useGeolocation'
import { findNewlyUnlocked } from '../unlock'
import type { Progress } from '../storage'
import type { Notice } from '../useProgress'
import type { Stop } from '../types'

interface TourScreenProps {
  stops: readonly Stop[]
  progress: Progress
  notices: readonly Notice[]
  onUnlock: (stopIds: readonly string[]) => void
  onRevealQuiz: (stopId: string) => void
  onDismissNotice: (key: string) => void
}

export function TourScreen({
  stops,
  progress,
  notices,
  onUnlock,
  onRevealQuiz,
  onDismissNotice,
}: TourScreenProps) {
  const { status, position, accuracy, message, retry } = useGeolocation(true)
  const { unlockedStopIds, revealedQuizStopIds, earnedBadgeIds } = progress

  useEffect(() => {
    if (!position) return
    const newlyUnlocked = findNewlyUnlocked(position, stops, unlockedStopIds)
    if (newlyUnlocked.length > 0) onUnlock(newlyUnlocked)
  }, [position, stops, unlockedStopIds, onUnlock])

  const signposted = stops.filter((stop) => !stop.isMystery)
  const signpostedUnlocked = signposted.filter((stop) => unlockedStopIds.includes(stop.id))
  const mysteriesFound = stops.filter(
    (stop) => stop.isMystery && unlockedStopIds.includes(stop.id),
  ).length

  return (
    <main className="screen">
      <header className="tour__header">
        <h1 className="tour__title">Journal</h1>
        <p className="tour__count">
          {signpostedUnlocked.length} of {signposted.length} stops unlocked
          {mysteriesFound > 0 &&
            ` · ${mysteriesFound} hidden stop${mysteriesFound === 1 ? '' : 's'} found`}
        </p>
      </header>

      <BadgeShelf earnedBadgeIds={earnedBadgeIds} />

      <div className={`status status--${status}`} role="status">
        {status === 'locating' && <span>Finding you&hellip;</span>}
        {status === 'tracking' && (
          <span>
            Following along
            {accuracy && accuracy >= 1 ? ` — accurate to about ${Math.round(accuracy)} m` : ''}
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

      <ul className="entries">
        {stops.map((stop) => (
          <JournalEntry
            key={stop.id}
            stop={stop}
            unlocked={unlockedStopIds.includes(stop.id)}
            quizRevealed={revealedQuizStopIds.includes(stop.id)}
            position={position}
            onRevealQuiz={onRevealQuiz}
          />
        ))}
      </ul>

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
