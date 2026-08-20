import { useCallback, useEffect, useState } from 'react'
import { earnedBadgeIds, findBadge } from './badges'
import { celebrate, primeCelebration } from './celebrate'
import { loadProgress, saveProgress, type Progress } from './storage'
import type { Stop } from './types'

/** At most this many celebrations on screen; older ones give way. */
const MAX_NOTICES = 3

export interface Notice {
  key: string
  kind: 'stop' | 'badge'
  title: string
  detail: string
}

/** Progress lives in localStorage on this one phone -- no accounts. */
export function useProgress(stops: readonly Stop[]) {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  // Badges are re-derived from what the visitor has done, then recorded so
  // each one is announced exactly once.
  useEffect(() => {
    const earned = earnedBadgeIds(stops, progress)
    const fresh = earned.filter((id) => !progress.earnedBadgeIds.includes(id))
    if (fresh.length === 0) return

    setProgress((prev) => ({
      ...prev,
      earnedBadgeIds: [...prev.earnedBadgeIds, ...fresh],
    }))

    setNotices((prev) => [
      ...prev,
      ...fresh.map((id) => {
        const badge = findBadge(id)
        return {
          key: `badge:${id}`,
          kind: 'badge' as const,
          title: badge ? `Badge earned: ${badge.name}` : 'Badge earned',
          detail: badge?.description ?? '',
        }
      }),
    ].slice(-MAX_NOTICES))
    celebrate()
  }, [stops, progress])

  const start = useCallback(() => {
    // The tap that starts the tour is also what lets us play sound later.
    primeCelebration()
    setProgress((prev) => (prev.started ? prev : { ...prev, started: true }))
  }, [])

  const unlock = useCallback(
    (stopIds: readonly string[]) => {
      if (stopIds.length === 0) return

      setProgress((prev) => {
        const fresh = stopIds.filter((id) => !prev.unlockedStopIds.includes(id))
        if (fresh.length === 0) return prev

        setNotices((current) => [
          ...current,
          ...fresh.map((id) => {
            const stop = stops.find((candidate) => candidate.id === id)
            return {
              key: `stop:${id}`,
              kind: 'stop' as const,
              title: stop?.isMystery ? 'Hidden stop found!' : 'Stop unlocked',
              detail: stop?.name ?? 'A new stop',
            }
          }),
        ].slice(-MAX_NOTICES))
        celebrate()

        return { ...prev, unlockedStopIds: [...prev.unlockedStopIds, ...fresh] }
      })
    },
    [stops],
  )

  const revealQuiz = useCallback((stopId: string) => {
    setProgress((prev) =>
      prev.revealedQuizStopIds.includes(stopId)
        ? prev
        : { ...prev, revealedQuizStopIds: [...prev.revealedQuizStopIds, stopId] },
    )
  }, [])

  const dismissNotice = useCallback((key: string) => {
    setNotices((prev) => prev.filter((notice) => notice.key !== key))
  }, [])

  return { progress, notices, start, unlock, revealQuiz, dismissNotice }
}
