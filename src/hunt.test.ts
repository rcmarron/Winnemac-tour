import { describe, expect, it } from 'vitest'
import { bandLabel, huntBand, initialHuntReading, nextHuntReading, trendLabel } from './hunt'

describe('nextHuntReading', () => {
  it('has no verdict on the first fix, only a mark to measure from', () => {
    expect(nextHuntReading(initialHuntReading, 120)).toEqual({ markDistance: 120, trend: 'unknown' })
  })

  it('says warmer when the visitor has closed the gap', () => {
    const reading = nextHuntReading({ markDistance: 120, trend: 'unknown' }, 90)
    expect(reading).toEqual({ markDistance: 90, trend: 'warmer' })
  })

  it('says colder when they have walked away', () => {
    const reading = nextHuntReading({ markDistance: 90, trend: 'warmer' }, 130)
    expect(reading).toEqual({ markDistance: 130, trend: 'colder' })
  })

  it('ignores GPS jitter and keeps the previous verdict', () => {
    const reading = nextHuntReading({ markDistance: 90, trend: 'warmer' }, 87)
    expect(reading).toEqual({ markDistance: 90, trend: 'warmer' })
  })

  it('holds the mark through jitter, so small real progress still registers', () => {
    // Three 3 m steps toward the stop. Each is noise on its own, but they add
    // up against a mark that has not moved: the second step crosses the
    // threshold and strikes a new mark, the third is noise against that one.
    let reading: ReturnType<typeof nextHuntReading> = { markDistance: 90, trend: 'unknown' }
    for (const distance of [87, 84, 81]) {
      reading = nextHuntReading(reading, distance)
    }
    expect(reading.trend).toBe('warmer')
    expect(reading.markDistance).toBe(84)
  })

  it('accepts a custom threshold', () => {
    expect(nextHuntReading({ markDistance: 50, trend: 'unknown' }, 48, 1).trend).toBe('warmer')
  })
})

describe('huntBand', () => {
  it('bands distance coarsely, so the exact spot stays hidden', () => {
    expect(huntBand(400)).toBe('far')
    expect(huntBand(151)).toBe('far')
    expect(huntBand(150)).toBe('nearby')
    expect(huntBand(61)).toBe('nearby')
    expect(huntBand(60)).toBe('close')
    expect(huntBand(26)).toBe('close')
    expect(huntBand(25)).toBe('burning')
    expect(huntBand(0)).toBe('burning')
  })
})

describe('labels', () => {
  it('never mentions a distance or a direction', () => {
    const words = [
      ...(['far', 'nearby', 'close', 'burning'] as const).map(bandLabel),
      ...(['unknown', 'warmer', 'colder', 'steady'] as const).map(trendLabel),
    ].join(' ')
    expect(words).not.toMatch(/\d/)
    expect(words.toLowerCase()).not.toMatch(/north|south|east|west|metre|meter|yard/)
  })
})
