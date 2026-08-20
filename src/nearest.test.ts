import { describe, expect, it } from 'vitest'
import { describeDistance, nearestStops } from './nearest'
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

const here = { latitude: 41.975, longitude: -87.691 }
const close = stop({ id: 'close', latitude: 41.9751, longitude: -87.691 })
const middle = stop({ id: 'middle', latitude: 41.9760, longitude: -87.691 })
const distant = stop({ id: 'distant', latitude: 41.9800, longitude: -87.691 })

describe('nearestStops', () => {
  it('orders stops by distance, closest first', () => {
    const ids = nearestStops([distant, close, middle], [], here).map((n) => n.stop.id)
    expect(ids).toEqual(['close', 'middle', 'distant'])
  })

  it('honours a limit', () => {
    const ids = nearestStops([distant, close, middle], [], here, 2).map((n) => n.stop.id)
    expect(ids).toEqual(['close', 'middle'])
  })

  it('keeps the declared order until there is a fix', () => {
    const ids = nearestStops([distant, close], [], null).map((n) => n.stop.id)
    expect(ids).toEqual(['distant', 'close'])
    expect(nearestStops([distant], [], null)[0].distanceMeters).toBeNull()
  })

  it('leaves an undiscovered mystery out, so its distance cannot give it away', () => {
    const secret = stop({ id: 'secret', isMystery: true, latitude: 41.9750, longitude: -87.6911 })
    const ids = nearestStops([close, secret], [], here).map((n) => n.stop.id)
    expect(ids).toEqual(['close'])
  })

  it('lists a mystery once it has been found', () => {
    const secret = stop({ id: 'secret', isMystery: true, latitude: 41.9750, longitude: -87.6911 })
    const ids = nearestStops([close, secret], ['secret'], here).map((n) => n.stop.id)
    expect(ids).toEqual(['secret', 'close'])
  })

  it('reports which stops are already unlocked', () => {
    const listed = nearestStops([close, middle], ['close'], here)
    expect(listed.map((n) => n.unlocked)).toEqual([true, false])
  })

  it('measures distance from the visitor, not the first stop', () => {
    const [nearest] = nearestStops([middle], [], here)
    expect(nearest.distanceMeters).toBeCloseTo(111, 0)
  })
})

describe('describeDistance', () => {
  it('rounds metres', () => {
    expect(describeDistance(138.6)).toBe('139 m')
  })

  it('switches to kilometres past 1000 m', () => {
    expect(describeDistance(1450)).toBe('1.5 km')
    expect(describeDistance(1000)).toBe('1 km')
    expect(describeDistance(2340)).toBe('2.3 km')
  })

  it('says so when there is no fix', () => {
    expect(describeDistance(null)).toBe('distance unknown')
  })
})
