/**
 * The park's outline, taken from OpenStreetMap way 27860785 -- the same data
 * the basemap tiles are drawn from, so stops and paths agree.
 *
 * Roughly 400 m square, bounded by Foster Ave, Damen Ave, Argyle St and
 * Leavitt St.
 */
export const PARK_BOUNDS = {
  south: 41.9723751,
  north: 41.9759504,
  west: -87.6841149,
  east: -87.6793777,
} as const

export const PARK_CENTRE = {
  latitude: (PARK_BOUNDS.south + PARK_BOUNDS.north) / 2,
  longitude: (PARK_BOUNDS.west + PARK_BOUNDS.east) / 2,
} as const

export interface WithinCheck {
  latitude: number
  longitude: number
}

/** True when a point sits inside the park outline. */
export function isInsidePark(point: WithinCheck): boolean {
  return (
    point.latitude >= PARK_BOUNDS.south &&
    point.latitude <= PARK_BOUNDS.north &&
    point.longitude >= PARK_BOUNDS.west &&
    point.longitude <= PARK_BOUNDS.east
  )
}
