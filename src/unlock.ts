import { isInsideZone, type Coordinates } from './geo'
import type { Stop } from './types'

/**
 * Stops whose trigger zone contains this position and that aren't unlocked
 * yet. Walking into a zone is the only way to unlock; revisiting is free.
 */
export function findNewlyUnlocked(
  position: Coordinates,
  stops: readonly Stop[],
  unlockedStopIds: readonly string[],
): string[] {
  const unlocked = new Set(unlockedStopIds)

  return stops
    .filter((stop) => !unlocked.has(stop.id) && isInsideZone(position, stop))
    .map((stop) => stop.id)
}
