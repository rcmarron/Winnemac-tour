import { distanceInMeters, type Coordinates } from './geo'
import type { Stop } from './types'

export interface MapPin {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  unlocked: boolean
}

/**
 * Pins for the map. Mystery stops are deliberately absent -- they stay off the
 * map so finding one feels like a discovery, and the journal teases them
 * instead.
 */
export function mapPins(stops: readonly Stop[], unlockedStopIds: readonly string[]): MapPin[] {
  const unlocked = new Set(unlockedStopIds)

  return stops
    .filter((stop) => !stop.isMystery)
    .map((stop) => ({
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      radius: stop.radius,
      unlocked: unlocked.has(stop.id),
    }))
}

export interface Bounds {
  south: number
  west: number
  north: number
  east: number
}

/** The box that holds every pin, plus the visitor if we know where they are. */
export function pinBounds(pins: readonly MapPin[], position: Coordinates | null): Bounds | null {
  const points: Coordinates[] = pins.map(({ latitude, longitude }) => ({ latitude, longitude }))
  if (position) points.push(position)
  if (points.length === 0) return null

  const latitudes = points.map((p) => p.latitude)
  const longitudes = points.map((p) => p.longitude)

  return {
    south: Math.min(...latitudes),
    west: Math.min(...longitudes),
    north: Math.max(...latitudes),
    east: Math.max(...longitudes),
  }
}

/** The nearest pin still to unlock, which is what the map should nudge toward. */
export function nextPin(pins: readonly MapPin[], position: Coordinates | null): MapPin | null {
  const locked = pins.filter((pin) => !pin.unlocked)
  if (locked.length === 0) return null
  if (!position) return locked[0]

  return locked.reduce((closest, pin) => {
    const distance = (a: MapPin) =>
      (a.latitude - position.latitude) ** 2 + (a.longitude - position.longitude) ** 2
    return distance(pin) < distance(closest) ? pin : closest
  })
}

/**
 * Whether the map should chase a new position.
 *
 * A phone reports a slightly different fix every second even when standing
 * still, and recentring on each one makes the map twitch. Below this the map
 * holds still.
 */
export const RECENTRE_THRESHOLD_M = 4

export function shouldRecentre(
  last: Coordinates | null,
  next: Coordinates,
  thresholdMeters: number = RECENTRE_THRESHOLD_M,
): boolean {
  if (!last) return true
  return distanceInMeters(last, next) >= thresholdMeters
}
