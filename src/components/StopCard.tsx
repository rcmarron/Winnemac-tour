import { distanceInMeters, type Coordinates } from '../geo'
import type { Stop } from '../types'

interface StopCardProps {
  stop: Stop
  unlocked: boolean
  position: Coordinates | null
}

function describeDistance(meters: number): string {
  if (meters < 1_000) return `${Math.round(meters)} m away`
  return `${(meters / 1_000).toFixed(1)} km away`
}

export function StopCard({ stop, unlocked, position }: StopCardProps) {
  const distance = position ? distanceInMeters(position, stop) : null

  return (
    <li className={`stop ${unlocked ? 'stop--unlocked' : 'stop--locked'}`}>
      <div className="stop__header">
        <h2 className="stop__name">{stop.name}</h2>
        <span className="stop__badge">{unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>

      {unlocked ? (
        <p className="stop__text">{stop.text}</p>
      ) : (
        <p className="stop__hint">
          Walk here to unlock
          {distance === null ? '' : ` \u2014 ${describeDistance(distance)}`}
        </p>
      )}
    </li>
  )
}
