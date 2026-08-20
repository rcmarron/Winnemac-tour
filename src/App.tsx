import { IntroScreen } from './components/IntroScreen'
import { TourScreen } from './components/TourScreen'
import { stops } from './stops'
import { useProgress } from './useProgress'

export function App() {
  const { progress, notices, start, unlock, revealQuiz, dismissNotice } = useProgress(stops)

  if (!progress.started) {
    const signpostedCount = stops.filter((stop) => !stop.isMystery).length
    return <IntroScreen stopCount={signpostedCount} onStart={start} />
  }

  return (
    <TourScreen
      stops={stops}
      progress={progress}
      notices={notices}
      onUnlock={unlock}
      onRevealQuiz={revealQuiz}
      onDismissNotice={dismissNotice}
    />
  )
}
