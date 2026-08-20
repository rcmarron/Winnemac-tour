import { describe, expect, it } from 'vitest'
import { findNewlyUnlocked } from './unlock'
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
