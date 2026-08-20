import { distanceInMeters, type Coordinates } from './geo'
import type { Stop } from './types'

/**
 * Most forgiveness we grant for a poor GPS fix, in metres.
 *
 * Under summer canopy a phone often reports a 20-30 m accuracy circle, and a
 * visitor standing at a stop can be placed outside a 20 m zone. Without this,
 * arriving simply does nothing -- the worst possible failure for this app. The
 * allowance is capped so a truly bad fix can't unlock the whole park.
 */
export const MAX_ACCURACY_ALLOWANCE_M = 20

/** How close a visitor must get to a stop, given how good their fix is. */
export function effectiveRadius(stop: Pick<Stop, 'radius'>, accuracyMeters: number | null): number {
  if (accuracyMeters === null || !Number.isFinite(accuracyMeters) || accuracyMeters <= 0) {
    return stop.radius
  }
  return stop.radius + Math.min(accuracyMeters, MAX_ACCURACY_ALLOWANCE_M)
}

/**
 * Stops close enough to count as arrived at, and not unlocked yet. Walking to
 * a stop is the only way to unlock; revisiting is free.
 */
export function findNewlyUnlocked(
  position: Coordinates,
  stops: readonly Stop[],
  unlockedStopIds: readonly string[],
  accuracyMeters: number | null = null,
): string[] {
  const unlocked = new Set(unlockedStopIds)

  return stops
    .filter(
      (stop) =>
        !unlocked.has(stop.id) &&
        distanceInMeters(position, stop) <= effectiveRadius(stop, accuracyMeters),
    )
    .map((stop) => stop.id)
}
