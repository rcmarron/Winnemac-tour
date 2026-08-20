import { describe, expect, it } from 'vitest'
import { MAX_ACCURACY_ALLOWANCE_M, effectiveRadius, findNewlyUnlocked } from './unlock'
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

const near = { latitude: 41.975, longitude: -87.691 }
const far = { latitude: 41.99, longitude: -87.691 }

describe('findNewlyUnlocked', () => {
  it('unlocks a stop the visitor has walked into', () => {
    expect(findNewlyUnlocked(near, [stop({ id: 'oak' })], [])).toEqual(['oak'])
  })

  it('ignores stops outside their trigger zone', () => {
    expect(findNewlyUnlocked(far, [stop({ id: 'oak' })], [])).toEqual([])
  })

  it('does not re-report a stop that is already unlocked', () => {
    expect(findNewlyUnlocked(near, [stop({ id: 'oak' })], ['oak'])).toEqual([])
  })

  it('unlocks mystery stops the same way as signposted ones', () => {
    const mystery = stop({ id: 'secret', isMystery: true, mysteryHint: 'Look closer.' })
    expect(findNewlyUnlocked(near, [mystery], [])).toEqual(['secret'])
  })

  it('can unlock several overlapping stops at once', () => {
    const stops = [stop({ id: 'a' }), stop({ id: 'b' }), stop({ id: 'c', latitude: 41.99 })]
    expect(findNewlyUnlocked(near, stops, [])).toEqual(['a', 'b'])
  })
})

describe('effectiveRadius', () => {
  const oak = { radius: 25 }

  it('is the plain radius when accuracy is unknown', () => {
    expect(effectiveRadius(oak, null)).toBe(25)
  })

  it('forgives a poor fix, so arriving under canopy still counts', () => {
    expect(effectiveRadius(oak, 15)).toBe(40)
  })

  it('caps the forgiveness, so a hopeless fix cannot unlock the park', () => {
    expect(effectiveRadius(oak, 500)).toBe(25 + MAX_ACCURACY_ALLOWANCE_M)
  })

  it('ignores nonsense accuracy values', () => {
    expect(effectiveRadius(oak, 0)).toBe(25)
    expect(effectiveRadius(oak, -5)).toBe(25)
    expect(effectiveRadius(oak, Number.NaN)).toBe(25)
  })
})

describe('findNewlyUnlocked with a fix quality', () => {
  const oak: Stop = {
    id: 'oak',
    name: 'Oak',
    latitude: 41.975,
    longitude: -87.691,
    radius: 20,
    isMystery: false,
    text: 'Placeholder.',
  }
  // ~33 m north of the stop: outside a 20 m zone, inside a forgiven one.
  const justOutside = { latitude: 41.9753, longitude: -87.691 }

  it('stays locked on a good fix', () => {
    expect(findNewlyUnlocked(justOutside, [oak], [], 2)).toEqual([])
  })

  it('unlocks on a poor fix, because the visitor may well be standing there', () => {
    expect(findNewlyUnlocked(justOutside, [oak], [], 25)).toEqual(['oak'])
  })
})
