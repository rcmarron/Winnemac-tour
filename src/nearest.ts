import { distanceInMeters, type Coordinates } from './geo'
import type { Stop } from './types'

export interface NearbyStop {
  stop: Stop
  /** Null until we have a position fix. */
  distanceMeters: number | null
  unlocked: boolean
}

/**
 * The stops to show in the sheet under the map, closest first.
 *
 * Undiscovered mystery stops are left out on purpose: listing one with a
 * distance would point straight at it and spoil the find. Once found, it
 * joins the list like any other stop.
 */
export function nearestStops(
  stops: readonly Stop[],
  unlockedStopIds: readonly string[],
  position: Coordinates | null,
  limit?: number,
): NearbyStop[] {
  const unlocked = new Set(unlockedStopIds)

  const listed = stops
    .filter((stop) => !stop.isMystery || unlocked.has(stop.id))
    .map((stop) => ({
      stop,
      unlocked: unlocked.has(stop.id),
      distanceMeters: position ? distanceInMeters(position, stop) : null,
    }))

  // With no fix yet, the declared order is the best we can honestly offer.
  if (position) {
    listed.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
  }

  return limit === undefined ? listed : listed.slice(0, limit)
}

export function describeDistance(meters: number | null): string {
  if (meters === null) return 'distance unknown'
  if (meters < 1_000) return `${Math.round(meters)} m`
  // Rounded on whole hundreds of metres: toFixed would show 1450 m as 1.4 km,
  // since 1.45 has no exact binary form.
  return `${Math.round(meters / 100) / 10} km`
}
