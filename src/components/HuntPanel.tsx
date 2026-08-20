import { bandLabel, huntBand, trendLabel, type HuntTrend } from '../hunt'

interface HuntPanelProps {
  hint: string
  trend: HuntTrend
  /** Distance is used only to pick a coarse band; it is never shown. */
  distanceMeters: number | null
  onGiveUp: () => void
}

export function HuntPanel({ hint, trend, distanceMeters, onGiveUp }: HuntPanelProps) {
  const band = distanceMeters === null ? null : huntBand(distanceMeters)

  return (
    <div className={`hunt hunt--${trend}`}>
      <p className="hunt__eyebrow">Hunting a hidden stop</p>
      <p className="hunt__trend">{trendLabel(trend)}</p>
      <p className="hunt__band">
        {band === null ? 'Waiting for your location…' : bandLabel(band)}
      </p>
      <p className="hunt__hint">{hint}</p>
      <button type="button" className="button button--small button--quiet" onClick={onGiveUp}>
        Stop hunting
      </button>
    </div>
  )
}
