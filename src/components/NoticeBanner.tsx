import { useEffect } from 'react'
import type { Notice } from '../useProgress'

interface NoticeBannerProps {
  notice: Notice
  onDismiss: (key: string) => void
}

const VISIBLE_MS = 5_000

/** The on-screen half of the unlock celebration -- what every phone gets. */
export function NoticeBanner({ notice, onDismiss }: NoticeBannerProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(notice.key), VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [notice.key, onDismiss])

  return (
    <div className={`notice notice--${notice.kind}`} role="status" aria-live="polite">
      <p className="notice__body">
        <span className="notice__title">{notice.detail ? `${notice.title} ·` : notice.title}</span>
        {notice.detail && <span className="notice__detail">{notice.detail}</span>}
      </p>
      <button
        type="button"
        className="notice__close"
        aria-label="Dismiss"
        onClick={() => onDismiss(notice.key)}
      >
        ×
      </button>
    </div>
  )
}
