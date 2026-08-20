import { describe, expect, it } from 'vitest'
import { afterGeolocationError, type GeolocationState } from './useGeolocation'

const tracking: GeolocationState = {
  status: 'tracking',
  position: { latitude: 41.9745, longitude: -87.6817 },
  accuracy: 12,
  message: null,
}

const nothingYet: GeolocationState = {
  status: 'locating',
  position: null,
  accuracy: null,
  message: null,
}

describe('afterGeolocationError', () => {
  it('ignores a transient failure while a fix is in hand', () => {
    // Same object identity: nothing re-renders, so the dot cannot blink.
    expect(afterGeolocationError(tracking, false)).toBe(tracking)
  })

  it('reports a failure when there is no fix to fall back on', () => {
    const next = afterGeolocationError(nothingYet, false)
    expect(next.status).toBe('error')
    expect(next.message).toMatch(/could not get a location fix/i)
  })

  it('drops the position when permission is denied, fix or not', () => {
    expect(afterGeolocationError(tracking, true)).toEqual({
      status: 'denied',
      position: null,
      accuracy: null,
      message: 'Location is blocked. Enable it for this site, then try again.',
    })
  })

  it('explains how to fix a denial', () => {
    expect(afterGeolocationError(nothingYet, true).message).toMatch(/enable it for this site/i)
  })
})
