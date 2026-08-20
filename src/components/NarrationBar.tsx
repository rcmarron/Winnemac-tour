import type { Track } from '../useNarration'

interface NarrationBarProps {
  track: Track
  playing: boolean
  blocked: boolean
  onToggle: () => void
  onStop: () => void
}

export function NarrationBar({ track, playing, blocked, onToggle, onStop }: NarrationBarProps) {
  return (
    <div className="narration" data-track={track.url}>
      <button
        type="button"
        className="narration__play"
        onClick={onToggle}
        aria-label={playing ? 'Pause narration' : 'Play narration'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <p className="narration__label">
        <span className="narration__name">{track.name}</span>
        <span className="narration__state">
          {playing ? 'Narration playing' : blocked ? 'Tap to play narration' : 'Narration paused'}
        </span>
      </p>
      <button type="button" className="narration__close" aria-label="Close narration" onClick={onStop}>
        ×
      </button>
    </div>
  )
}
