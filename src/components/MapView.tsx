import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  mapPins,
  nextPin,
  pinBounds,
  shouldRecentre,
  type MapPin,
} from '../mapModel'
import { PARK_CENTRE } from '../park'
import type { Coordinates } from '../geo'
import type { Stop } from '../types'

/**
 * OpenStreetMap tiles: no key, no account, and the park's paths are already
 * mapped. Attribution is required, and is added below.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Closest we zoom while following: near enough to pick out the right path. */
const FOLLOW_ZOOM = 18

/**
 * Furthest we back off to keep the next stop in frame. The park is only about
 * 400 m across, so 16 already holds the whole of it.
 */
const MIN_FOLLOW_ZOOM = 16

/**
 * Zoom events fired this recently are treated as ours rather than the
 * visitor's. Leaflet does not say who caused a zoom, and our own recentring
 * would otherwise look like a gesture and cancel following.
 */
const SELF_MOVE_GRACE_MS = 600

interface MapViewProps {
  stops: readonly Stop[]
  unlockedStopIds: readonly string[]
  position: Coordinates | null
}

const pinIcon = (unlocked: boolean) =>
  L.divIcon({
    className: `pin ${unlocked ? 'pin--unlocked' : 'pin--locked'}`,
    html: `<span aria-hidden="true">${unlocked ? '★' : ''}</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })

/**
 * The visitor's dot is an SVG circle rather than a div icon: Leaflet swaps a
 * div icon's element on every setLatLng, which showed up as the dot blinking
 * once a second. A circle marker just moves.
 */
const ME_STYLE: L.CircleMarkerOptions = {
  radius: 6,
  className: 'me-dot',
  interactive: false,
}

/**
 * How far out to sit while following. Centred on the visitor, a fixed zoom can
 * leave the next stop outside the viewport -- and an empty map is no help in
 * deciding where to walk -- so back off just far enough to hold it in frame.
 */
function followZoom(instance: L.Map, position: Coordinates, target: MapPin | null): number {
  if (!target) return FOLLOW_ZOOM

  const here = L.latLng(position.latitude, position.longitude)
  const to = L.latLng(target.latitude, target.longitude)
  // Mirror the stop across the visitor, so the box they must both fit in is
  // one the visitor stays centred in.
  const away = L.latLng(2 * here.lat - to.lat, 2 * here.lng - to.lng)
  const fitted = instance.getBoundsZoom(L.latLngBounds([to, away]), false, L.point(34, 34))

  return Math.max(MIN_FOLLOW_ZOOM, Math.min(FOLLOW_ZOOM, fitted))
}

/** One stop's drawing on the map, kept alive between renders. */
interface StopLayer {
  marker: L.Marker
  zone: L.Circle
  unlocked: boolean
}

export function MapView({ stops, unlockedStopIds, position }: MapViewProps) {
  const container = useRef<HTMLDivElement | null>(null)
  const map = useRef<L.Map | null>(null)
  const overlay = useRef<L.LayerGroup | null>(null)
  const framed = useRef(false)
  const centred = useRef(false)

  // Layers persist and are edited in place. Rebuilding them on every fix made
  // the markers blink and fought the pan animation.
  const stopLayers = useRef(new Map<string, StopLayer>())
  const meMarker = useRef<L.CircleMarker | null>(null)
  const lastCentre = useRef<Coordinates | null>(null)

  const following = useRef(true)
  const lastSelfMove = useRef(0)
  const framedTargetId = useRef<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(true)

  // A stable identity, so the drawing effect runs on real changes only.
  const unlockedKey = unlockedStopIds.join('|')
  const pins = useMemo(() => mapPins(stops, unlockedKey ? unlockedKey.split('|') : []), [
    stops,
    unlockedKey,
  ])

  // Create the map once; Leaflet owns this DOM node from here on.
  useEffect(() => {
    if (!container.current || map.current) return

    // Captured for the cleanup: the ref itself may point elsewhere by then.
    const drawnStops = stopLayers.current
    const instance = L.map(container.current, { zoomControl: true, attributionControl: true })
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(instance)
    overlay.current = L.layerGroup().addTo(instance)

    lastSelfMove.current = Date.now()
    // Somewhere sensible for the moment before the first fix arrives.
    instance.setView([PARK_CENTRE.latitude, PARK_CENTRE.longitude], 16)

    const releaseFollow = () => {
      if (!following.current) return
      following.current = false
      setIsFollowing(false)
    }

    // A drag is always the visitor. A zoom might be ours, so it is graced.
    instance.on('dragstart', releaseFollow)
    instance.on('zoomstart', () => {
      if (Date.now() - lastSelfMove.current > SELF_MOVE_GRACE_MS) releaseFollow()
    })

    map.current = instance

    return () => {
      instance.remove()
      map.current = null
      overlay.current = null
      drawnStops.clear()
      meMarker.current = null
      framed.current = false
      centred.current = false
      lastCentre.current = null
    }
  }, [])

  // Stop pins and zones: added once, then only touched when something changed.
  useEffect(() => {
    const layer = overlay.current
    if (!layer) return

    const live = stopLayers.current
    const seen = new Set<string>()

    for (const pin of pins) {
      seen.add(pin.id)
      const existing = live.get(pin.id)

      if (!existing) {
        const zone = L.circle([pin.latitude, pin.longitude], {
          radius: pin.radius,
          className: `zone ${pin.unlocked ? 'zone--unlocked' : 'zone--locked'}`,
        }).addTo(layer)

        const marker = L.marker([pin.latitude, pin.longitude], {
          icon: pinIcon(pin.unlocked),
          title: pin.name,
          alt: pin.name,
        })
          .bindTooltip(pin.name, { direction: 'top', offset: [0, -12] })
          .addTo(layer)

        live.set(pin.id, { marker, zone, unlocked: pin.unlocked })
        continue
      }

      if (existing.unlocked !== pin.unlocked) {
        existing.marker.setIcon(pinIcon(pin.unlocked))
        // setStyle does not rewrite className, so set it on the path itself.
        existing.zone
          .getElement()
          ?.setAttribute('class', `zone ${pin.unlocked ? 'zone--unlocked' : 'zone--locked'}`)
        existing.unlocked = pin.unlocked
      }
    }

    for (const [id, drawn] of live) {
      if (seen.has(id)) continue
      drawn.marker.remove()
      drawn.zone.remove()
      live.delete(id)
    }
  }, [pins])

  // The visitor's own dot: moved, never rebuilt.
  useEffect(() => {
    const layer = overlay.current
    if (!layer) return

    if (!position) {
      meMarker.current?.remove()
      meMarker.current = null
      return
    }

    const here = L.latLng(position.latitude, position.longitude)

    if (!meMarker.current) {
      meMarker.current = L.circleMarker(here, ME_STYLE).addTo(layer)
      return
    }

    meMarker.current.setLatLng(here)
  }, [position])

  // Keep the visitor in the middle for as long as they let us.
  useEffect(() => {
    const instance = map.current
    if (!instance) return

    if (position && following.current) {
      const target = nextPin(pins, position)
      const here = L.latLng(position.latitude, position.longitude)
      const targetChanged = framedTargetId.current !== (target?.id ?? null)

      if (!centred.current || targetChanged) {
        // Re-choose the zoom only on the first fix and when the next stop
        // changes, so walking never makes the map breathe in and out.
        lastSelfMove.current = Date.now()
        instance.setView(here, followZoom(instance, position, target), { animate: false })
        centred.current = true
        framedTargetId.current = target?.id ?? null
        lastCentre.current = position
        return
      }

      // Ignore twitch: chasing every fix is what made this feel unsteady.
      if (!shouldRecentre(lastCentre.current, position)) return

      lastSelfMove.current = Date.now()
      lastCentre.current = position
      instance.panTo(here, { animate: true, duration: 0.5 })
      return
    }

    // Before the first fix there is nobody to centre on, so show the stops.
    if (!framed.current && !position) {
      const bounds = pinBounds(pins, null)
      if (!bounds) return

      lastSelfMove.current = Date.now()
      instance.fitBounds(
        [
          [bounds.south, bounds.west],
          [bounds.north, bounds.east],
        ],
        // No animation: a zoom tween briefly draws pins away from their zones,
        // which reads as a misplaced stop.
        { padding: [40, 40], maxZoom: FOLLOW_ZOOM, animate: false },
      )
      framed.current = true
    }
  }, [pins, position])

  const centreOnMe = useCallback(() => {
    const instance = map.current
    if (!instance || !position) return

    const target = nextPin(pins, position)
    following.current = true
    setIsFollowing(true)
    centred.current = true
    framedTargetId.current = target?.id ?? null
    lastCentre.current = position
    lastSelfMove.current = Date.now()
    // Re-frame on the next stop, exactly as the first fix does.
    instance.setView([position.latitude, position.longitude], followZoom(instance, position, target))
  }, [pins, position])

  return (
    <div className="map">
      <div ref={container} className="map__canvas" role="application" aria-label="Tour map" />
      <button
        type="button"
        className={`button button--small map__recentre ${
          isFollowing ? 'map__recentre--following' : ''
        }`}
        onClick={centreOnMe}
        disabled={!position}
        aria-pressed={isFollowing}
      >
        {isFollowing ? 'Following you' : 'Centre on me'}
      </button>
      <p className="map__legend">
        <span className="legend__swatch legend__swatch--locked" aria-hidden="true" /> to visit
        <span className="legend__swatch legend__swatch--unlocked" aria-hidden="true" /> unlocked
        <span className="legend__swatch legend__swatch--me" aria-hidden="true" /> you
      </p>
    </div>
  )
}
