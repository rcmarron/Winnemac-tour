import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { mapPins, pinBounds } from '../mapModel'
import type { Coordinates } from '../geo'
import type { Stop } from '../types'

/**
 * OpenStreetMap tiles: no key, no account, and the park's paths are already
 * mapped. Attribution is required, and is added below.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

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

  const pins = mapPins(stops, unlockedStopIds)

  // Create the map once; Leaflet owns this DOM node from here on.
  useEffect(() => {
    if (!container.current || map.current) return

    const instance = L.map(container.current, { zoomControl: true, attributionControl: true })
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(instance)
    overlay.current = L.layerGroup().addTo(instance)
    instance.setView([41.9754, -87.6907], 16)
    map.current = instance

    return () => {
      instance.remove()
      map.current = null
      overlay.current = null
      framed.current = false
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

    // Frame everything once, then leave the view under the visitor's control.
    if (!framed.current) {
      const bounds = pinBounds(pins, position)
      if (bounds) {
        instance.fitBounds(
          [
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ],
          // No animation: a zoom tween briefly draws pins away from their
          // zones, which reads as a misplaced stop.
          { padding: [40, 40], maxZoom: 17, animate: false },
        )
        framed.current = true
      }
    }
  }, [pins, position])

  const centreOnMe = () => {
    if (map.current && position) map.current.setView([position.latitude, position.longitude], 17)
  }

  return (
    <div className="map">
      <div ref={container} className="map__canvas" role="application" aria-label="Tour map" />
      <button
        type="button"
        className="button button--small map__recentre"
        onClick={centreOnMe}
        disabled={!position}
      >
        Centre on me
      </button>
      <p className="map__legend">
        <span className="legend__swatch legend__swatch--locked" aria-hidden="true" /> to visit
        <span className="legend__swatch legend__swatch--unlocked" aria-hidden="true" /> unlocked
        <span className="legend__swatch legend__swatch--me" aria-hidden="true" /> you
      </p>
    </div>
  )
}
