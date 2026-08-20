import { describe, expect, it } from 'vitest'
import { distanceInMeters } from './geo'
import { PARK_BOUNDS, isInsidePark } from './park'
import { stops } from './stops'

describe('stops', () => {
  it.each(stops.map((stop) => [stop.name, stop] as const))(
    '%s sits inside the park',
    (_name, stop) => {
      expect(isInsidePark(stop)).toBe(true)
    },
  )

  it.each(stops.map((stop) => [stop.name, stop] as const))(
    "%s's whole trigger zone sits inside the park",
    (_name, stop) => {
      // A zone hanging over the fence would unlock from the pavement outside.
      const toEdge = Math.min(
        distanceInMeters(stop, { latitude: PARK_BOUNDS.north, longitude: stop.longitude }),
        distanceInMeters(stop, { latitude: PARK_BOUNDS.south, longitude: stop.longitude }),
        distanceInMeters(stop, { latitude: stop.latitude, longitude: PARK_BOUNDS.west }),
        distanceInMeters(stop, { latitude: stop.latitude, longitude: PARK_BOUNDS.east }),
      )
      expect(toEdge).toBeGreaterThanOrEqual(stop.radius)
    },
  )

  it('gives every stop a unique id', () => {
    expect(new Set(stops.map((stop) => stop.id)).size).toBe(stops.length)
  })

  it('keeps stops far enough apart that zones cannot overlap', () => {
    for (const a of stops) {
      for (const b of stops) {
        if (a.id === b.id) continue
        expect(distanceInMeters(a, b)).toBeGreaterThan(a.radius + b.radius)
      }
    }
  })

  it('has the five hidden stops the tour promises', () => {
    expect(stops.filter((stop) => stop.isMystery)).toHaveLength(5)
  })

  it('gives every mystery stop a hint to tease it in the journal', () => {
    for (const stop of stops.filter((s) => s.isMystery)) {
      expect(stop.mysteryHint?.length ?? 0).toBeGreaterThan(0)
    }
  })
})
