import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapPins, nextPin, pinBounds, type MapPin } from '../mapModel'
import type { Coordinates } from '../geo'
import type { Stop } from '../types'

/**
 * OpenStreetMap tiles: no key, no account, and the park's paths are already
 * mapped. Attribution is required, and is added below.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/** Closest we zoom while following: near enough to read the paths around you. */
const FOLLOW_ZOOM = 17

/** Furthest we back off to keep the next stop in frame. */
const MIN_FOLLOW_ZOOM = 14

/**
 * Zoom events fired this recently are treated as ours rather than the
 * visitor's. Leaflet does not say who caused a zoom, and our own recentring
 * would otherwise look like a gesture and cancel following.
 */
const SELF_MOVE_GRACE_MS = 600

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

const meIcon = () =>
  L.divIcon({ className: 'pin pin--me', html: '', iconSize: [16, 16], iconAnchor: [8, 8] })

export function MapView({ stops, unlockedStopIds, position }: MapViewProps) {
  const container = useRef<HTMLDivElement | null>(null)
  const map = useRef<L.Map | null>(null)
  const overlay = useRef<L.LayerGroup | null>(null)
  const framed = useRef(false)
  const centred = useRef(false)

  // The map follows the visitor until they move it themselves; otherwise every
  // position update would yank the view out from under them.
  const following = useRef(true)
  const lastSelfMove = useRef(0)
  const framedTargetId = useRef<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(true)

  const pins = mapPins(stops, unlockedStopIds)

  // Create the map once; Leaflet owns this DOM node from here on.
  useEffect(() => {
    if (!container.current || map.current) return

    const instance = L.map(container.current, { zoomControl: true, attributionControl: true })
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(instance)
    overlay.current = L.layerGroup().addTo(instance)

    lastSelfMove.current = Date.now()
    instance.setView([41.9754, -87.6907], 16)

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
      framed.current = false
      centred.current = false
    }
  }, [])

  // Redraw pins whenever unlock state or the visitor's position changes.
  useEffect(() => {
    const instance = map.current
    const layer = overlay.current
    if (!instance || !layer) return

    layer.clearLayers()

    for (const pin of pins) {
      L.circle([pin.latitude, pin.longitude], {
        radius: pin.radius,
        className: `zone ${pin.unlocked ? 'zone--unlocked' : 'zone--locked'}`,
      }).addTo(layer)

      L.marker([pin.latitude, pin.longitude], {
        icon: pinIcon(pin.unlocked),
        title: pin.name,
        alt: pin.name,
      })
        .bindTooltip(pin.name, { direction: 'top', offset: [0, -12] })
        .addTo(layer)
    }

    if (position) {
      L.marker([position.latitude, position.longitude], {
        icon: meIcon(),
        title: 'You are here',
        alt: 'You are here',
        zIndexOffset: 1000,
      }).addTo(layer)
    }
  }, [pins, position])

  // Keep the visitor in the middle for as long as they let us.
  useEffect(() => {
    const instance = map.current
    if (!instance) return

    if (position && following.current) {
      const target = nextPin(pins, position)
      const here = L.latLng(position.latitude, position.longitude)
      const targetChanged = framedTargetId.current !== (target?.id ?? null)
      lastSelfMove.current = Date.now()

      if (!centred.current || targetChanged) {
        // Re-choose the zoom only on the first fix and when the next stop
        // changes, so walking never makes the map breathe in and out.
        instance.setView(here, followZoom(instance, position, target), { animate: false })
        centred.current = true
        framedTargetId.current = target?.id ?? null
      } else {
        // Same zoom, so glide: walking should feel continuous.
        instance.panTo(here, { animate: true, duration: 0.6 })
      }
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

  const centreOnMe = () => {
    const instance = map.current
    if (!instance || !position) return

    const target = nextPin(pins, position)
    following.current = true
    setIsFollowing(true)
    centred.current = true
    framedTargetId.current = target?.id ?? null
    lastSelfMove.current = Date.now()
    // Re-frame on the next stop, exactly as the first fix does.
    instance.setView(
      [position.latitude, position.longitude],
      followZoom(instance, position, target),
    )
  }

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
