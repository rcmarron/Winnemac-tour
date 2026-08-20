import { describe, expect, it } from 'vitest'
import { distanceInMeters, isInsideZone } from './geo'

const zone = { latitude: 41.9749, longitude: -87.6913, radius: 25 }

describe('distanceInMeters', () => {
  it('is zero for the same point', () => {
    expect(distanceInMeters(zone, zone)).toBe(0)
  })

  it('measures a short north-south hop', () => {
    const north = { latitude: zone.latitude + 0.001, longitude: zone.longitude }
    expect(distanceInMeters(zone, north)).toBeCloseTo(111, 0)
  })
})

describe('isInsideZone', () => {
  it('unlocks at the center', () => {
    expect(isInsideZone(zone, zone)).toBe(true)
  })

  it('stays locked well outside the radius', () => {
    const away = { latitude: zone.latitude + 0.005, longitude: zone.longitude }
    expect(isInsideZone(away, zone)).toBe(false)
  })
})
