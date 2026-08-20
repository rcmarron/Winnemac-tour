import { describe, expect, it } from 'vitest'
import { mapPins, nextPin, pinBounds, shouldRecentre } from './mapModel'
import type { Stop } from './types'

const stop = (overrides: Partial<Stop> & Pick<Stop, 'id'>): Stop => ({
  name: overrides.name ?? overrides.id,
  latitude: 41.975,
  longitude: -87.691,
  radius: 25,
  isMystery: false,
  text: 'Placeholder.',
  ...overrides,
})

describe('mapPins', () => {
  it('keeps mystery stops off the map, found or not', () => {
    const stops = [stop({ id: 'oak' }), stop({ id: 'secret', isMystery: true })]
    expect(mapPins(stops, []).map((p) => p.id)).toEqual(['oak'])
    expect(mapPins(stops, ['secret']).map((p) => p.id)).toEqual(['oak'])
  })

  it('marks which pins are already unlocked', () => {
    const stops = [stop({ id: 'oak' }), stop({ id: 'elm' })]
    expect(mapPins(stops, ['oak']).map((p) => p.unlocked)).toEqual([true, false])
  })

  it('carries the trigger radius through for drawing the zone', () => {
    expect(mapPins([stop({ id: 'oak', radius: 40 })], [])[0].radius).toBe(40)
  })
})

describe('pinBounds', () => {
  it('returns null with nothing to frame', () => {
    expect(pinBounds([], null)).toBeNull()
  })

  it('boxes every pin', () => {
    const stops = [
      stop({ id: 'a', latitude: 41.97, longitude: -87.7 }),
      stop({ id: 'b', latitude: 41.98, longitude: -87.68 }),
    ]
    expect(pinBounds(mapPins(stops, []), null)).toEqual({
      south: 41.97,
      west: -87.7,
      north: 41.98,
      east: -87.68,
    })
  })

  it('includes the visitor so they are never off-screen', () => {
    const pins = mapPins([stop({ id: 'a', latitude: 41.97, longitude: -87.7 })], [])
    expect(pinBounds(pins, { latitude: 41.99, longitude: -87.6 })).toEqual({
      south: 41.97,
      west: -87.7,
      north: 41.99,
      east: -87.6,
    })
  })
})

describe('nextPin', () => {
  const near = stop({ id: 'near', latitude: 41.9751, longitude: -87.6911 })
  const far = stop({ id: 'far', latitude: 41.99, longitude: -87.71 })

  it('picks the closest stop still locked', () => {
    const pins = mapPins([far, near], [])
    expect(nextPin(pins, { latitude: 41.975, longitude: -87.691 })?.id).toBe('near')
  })

  it('skips stops already unlocked', () => {
    const pins = mapPins([far, near], ['near'])
    expect(nextPin(pins, { latitude: 41.975, longitude: -87.691 })?.id).toBe('far')
  })

  it('returns null once every stop is unlocked', () => {
    const pins = mapPins([near], ['near'])
    expect(nextPin(pins, { latitude: 41.975, longitude: -87.691 })).toBeNull()
  })

  it('falls back to the first locked stop with no position yet', () => {
    expect(nextPin(mapPins([far, near], []), null)?.id).toBe('far')
  })
})

describe('shouldRecentre', () => {
  const here = { latitude: 41.975, longitude: -87.691 }

  it('centres when there is nowhere to compare to', () => {
    expect(shouldRecentre(null, here)).toBe(true)
  })

  it('holds still for GPS twitch', () => {
    // ~1 m north: a standing-still phone, not a walking visitor.
    expect(shouldRecentre(here, { latitude: 41.975009, longitude: -87.691 })).toBe(false)
  })

  it('follows a real step', () => {
    // ~11 m north.
    expect(shouldRecentre(here, { latitude: 41.9751, longitude: -87.691 })).toBe(true)
  })

  it('respects a custom threshold', () => {
    expect(shouldRecentre(here, { latitude: 41.975009, longitude: -87.691 }, 0.5)).toBe(true)
  })
})
