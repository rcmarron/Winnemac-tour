import type { Stop } from './types'

export interface Badge {
  id: string
  name: string
  description: string
}

export const BADGES: readonly Badge[] = [
  {
    id: 'first-discovery',
    name: 'First Discovery',
    description: 'Unlocked your first stop.',
  },
  {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Reached half the stops on the tour.',
  },
  {
    id: 'park-naturalist',
    name: 'Park Naturalist',
    description: 'Visited every stop and looked at every question.',
  },
]

export const findBadge = (id: string): Badge | undefined => BADGES.find((b) => b.id === id)

interface Earned {
  unlockedStopIds: readonly string[]
  revealedQuizStopIds: readonly string[]
}

/**
 * Which badges the visitor has earned, judged only from what they've done --
 * so a badge can never be lost, and re-deriving it is always safe.
 *
 * Mystery stops deliberately don't count toward the signposted totals: finding
 * a hidden stop is a bonus, and never finding one shouldn't make the tour look
 * unfinished. (Keen Eye, for all five mysteries, arrives with Phase 3.)
 */
export function earnedBadgeIds(stops: readonly Stop[], progress: Earned): string[] {
  const unlocked = new Set(progress.unlockedStopIds)
  const revealed = new Set(progress.revealedQuizStopIds)

  const signposted = stops.filter((stop) => !stop.isMystery)
  const signpostedUnlocked = signposted.filter((stop) => unlocked.has(stop.id))

  const earned: string[] = []

  if (unlocked.size >= 1) earned.push('first-discovery')

  if (signposted.length > 0 && signpostedUnlocked.length >= Math.ceil(signposted.length / 2)) {
    earned.push('halfway-there')
  }

  const naturalistQuizzes = stops.filter((stop) => stop.quiz && stop.countsForNaturalist)
  const everyStopVisited =
    signposted.length > 0 && signpostedUnlocked.length === signposted.length
  const everyQuestionSeen = naturalistQuizzes.every((stop) => revealed.has(stop.id))

  if (everyStopVisited && everyQuestionSeen) earned.push('park-naturalist')

  return earned
}
