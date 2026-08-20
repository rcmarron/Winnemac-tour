import { IntroScreen } from './components/IntroScreen'
import { TourScreen } from './components/TourScreen'
import { stops } from './stops'
import { useProgress } from './useProgress'

export function App() {
  const { progress, start, unlock } = useProgress()

  const signpostedCount = stops.filter((stop) => !stop.isMystery).length

  if (!progress.started) {
    return <IntroScreen stopCount={signpostedCount} onStart={start} />
  }

  return (
    <TourScreen stops={stops} unlockedStopIds={progress.unlockedStopIds} onUnlock={unlock} />
  )
}
