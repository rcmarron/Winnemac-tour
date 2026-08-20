import { useCallback, useEffect, useState } from 'react'
import type { Coordinates } from './geo'

export type GeolocationStatus =
  | 'idle'
  | 'locating'
  | 'tracking'
  | 'denied'
  | 'unsupported'
  | 'error'

export interface GeolocationState {
  status: GeolocationStatus
  position: Coordinates | null
  /** Reported accuracy radius in meters -- useful under tree canopy. */
  accuracy: number | null
  message: string | null
}

const initialState: GeolocationState = {
  status: 'idle',
  position: null,
  accuracy: null,
  message: null,
}

/**
 * What a failed fix should do to what we already know.
 *
 * A watch throws the occasional transient error even while working -- and
 * treating that as "we no longer know where you are" makes the map's dot blink
 * out and the follow lose its target once a second. So a transient failure is
 * ignored outright while a fix is in hand; only a denial, or a failure before
 * any fix at all, changes anything.
 */
export function afterGeolocationError(
  previous: GeolocationState,
  denied: boolean,
): GeolocationState {
  if (denied) {
    return {
      status: 'denied',
      position: null,
      accuracy: null,
      message: 'Location is blocked. Enable it for this site, then try again.',
    }
  }

  // Same object, so React re-renders nothing at all.
  if (previous.position) return previous

  return {
    status: 'error',
    position: null,
    accuracy: null,
    message: 'Could not get a location fix. Try again in the open.',
  }
}

/**
 * Watches the visitor's position while `active`. Requesting the watch is what
 * triggers the browser's permission prompt, so this starts only after the
 * visitor taps "Start".
 */
export function useGeolocation(active: boolean) {
  const [state, setState] = useState<GeolocationState>(initialState)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    if (!active) {
      setState(initialState)
      return
    }

    if (!('geolocation' in navigator)) {
      setState({
        status: 'unsupported',
        position: null,
        accuracy: null,
        message: 'This browser cannot share your location.',
      })
      return
    }

    setState((prev) => ({ ...prev, status: prev.position ? 'tracking' : 'locating' }))

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setState({
          status: 'tracking',
          position: { latitude: coords.latitude, longitude: coords.longitude },
          accuracy: coords.accuracy,
          message: null,
        })
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED
        setState((previous) => afterGeolocationError(previous, denied))
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [active, attempt])

  return { ...state, retry }
}
