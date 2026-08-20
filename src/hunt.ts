/**
 * Hunting a hidden stop: warmer and colder, never a distance or a bearing.
 * Saying "37 m north" would end the game; the point is to wander and notice.
 */

export type HuntTrend = 'unknown' | 'warmer' | 'colder' | 'steady'

/** Coarse bands only -- fine-grained numbers would give the position away. */
export type HuntBand = 'far' | 'nearby' | 'close' | 'burning'

export interface HuntReading {
  /** The distance the last verdict was measured against. */
  markDistance: number | null
  trend: HuntTrend
}

export const initialHuntReading: HuntReading = { markDistance: null, trend: 'unknown' }

/**
 * Movement below this is treated as GPS noise rather than walking, so a
 * visitor standing still doesn't see the verdict flapping.
 */
export const MOVEMENT_THRESHOLD_M = 6

export function nextHuntReading(
  previous: HuntReading,
  distance: number,
  thresholdMeters: number = MOVEMENT_THRESHOLD_M,
): HuntReading {
  if (previous.markDistance === null) {
    return { markDistance: distance, trend: 'unknown' }
  }

  const closer = previous.markDistance - distance

  // Hold the mark until they've really moved: otherwise each jittery fix
  // becomes the new baseline and everything reads "steady".
  if (Math.abs(closer) < thresholdMeters) {
    return { markDistance: previous.markDistance, trend: previous.trend }
  }

  return { markDistance: distance, trend: closer > 0 ? 'warmer' : 'colder' }
}

export function huntBand(distance: number): HuntBand {
  if (distance > 150) return 'far'
  if (distance > 60) return 'nearby'
  if (distance > 25) return 'close'
  return 'burning'
}

export function bandLabel(band: HuntBand): string {
  switch (band) {
    case 'far':
      return 'Cold — try another part of the park'
    case 'nearby':
      return 'Somewhere around here'
    case 'close':
      return 'Close now — look around you'
    case 'burning':
      return 'Burning hot — it is right here'
  }
}

export function trendLabel(trend: HuntTrend): string {
  switch (trend) {
    case 'warmer':
      return 'Warmer'
    case 'colder':
      return 'Colder'
    case 'steady':
      return 'No change'
    case 'unknown':
      return 'Start walking'
  }
}
