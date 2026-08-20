const EARTH_RADIUS_METERS = 6_371_008.8

export interface Coordinates {
  latitude: number
  longitude: number
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Great-circle distance between two coordinates, in meters. */
export function distanceInMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLon = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

/** True when a position falls inside a stop's trigger zone. */
export function isInsideZone(
  position: Coordinates,
  zone: Coordinates & { radius: number },
): boolean {
  return distanceInMeters(position, zone) <= zone.radius
}
