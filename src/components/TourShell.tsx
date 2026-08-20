import { useCallback, useEffect, useRef, useState } from 'react'
import { MapView } from './MapView'
import { NarrationBar } from './NarrationBar'
import { NoticeBanner } from './NoticeBanner'
import { StopSheet } from './StopSheet'
import { useGeolocation } from '../useGeolocation'
import { useNarration } from '../useNarration'
import { findNewlyUnlocked } from '../unlock'
import { distanceInMeters } from '../geo'
import { initialHuntReading, nextHuntReading, type HuntReading } from '../hunt'
import type { SheetMode } from './StopSheet'
import type { Progress } from '../storage'
import type { Notice } from '../useProgress'
import type { Stop } from '../types'

interface TourShellProps {
  stops: readonly Stop[]
  progress: Progress
  notices: readonly Notice[]
  onUnlock: (stopIds: readonly string[]) => void
  onRevealQuiz: (stopId: string) => void
  onDismissNotice: (key: string) => void
}

export function TourShell({
  stops,
  progress,
  notices,
  onUnlock,
  onRevealQuiz,
  onDismissNotice,
}: TourShellProps) {
  const [expanded, setExpanded] = useState(false)
  const [sheetMode, setSheetMode] = useState<SheetMode>('list')
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null)
  const [hunt, setHunt] = useState<HuntReading>(initialHuntReading)
  const { status, position, accuracy, message, retry } = useGeolocation(true)
  const narration = useNarration(import.meta.env.BASE_URL)
  const { unlockedStopIds } = progress

  const playNarration = useCallback(
    (stop: Stop) => {
      if (!stop.audioUrl) return
      narration.start({ stopId: stop.id, name: stop.name, audioUrl: stop.audioUrl })
    },
    [narration],
  )

  const openStop = useCallback((stopId: string) => {
    setFocusedStopId(stopId)
    setSheetMode('stop')
    setExpanded(false)
  }, [])

  const startHunt = useCallback((stopId: string) => {
    setFocusedStopId(stopId)
    setSheetMode('hunt')
    setExpanded(false)
    setHunt(initialHuntReading)
  }, [])

  const backToList = useCallback(() => {
    setSheetMode('list')
    setFocusedStopId(null)
    setHunt(initialHuntReading)
  }, [])

  // Read inside the arrival effect without making it re-run on every change.
  const modeRef = useRef(sheetMode)
  const focusedRef = useRef(focusedStopId)
  modeRef.current = sheetMode
  focusedRef.current = focusedStopId

  // Narration starts on arrival, where a stop has any: the visitor should be
  // able to pocket the phone and listen. Announced arrivals are tracked so a
  // re-render never restarts a track.
  const announced = useRef(new Set<string>())
  useEffect(() => {
    for (const notice of notices) {
      if (notice.kind !== 'stop' || !notice.stopId) continue
      if (announced.current.has(notice.stopId)) continue

      announced.current.add(notice.stopId)
      const arrived = stops.find((stop) => stop.id === notice.stopId)

      // Arriving pops the stop open. Before this, a visitor could walk to a
      // stop and find nothing to tap.
      //
      // A hunt in progress is the one thing that outranks this: stumbling onto
      // an unrelated stop mid-hunt shouldn't end the hunt. The banner still
      // announces it, and the journal still has it. Finding the hunted stop
      // does open, since that is the reveal the hunt was for.
      const huntingSomethingElse =
        modeRef.current === 'hunt' && focusedRef.current !== notice.stopId

      if (!huntingSomethingElse) openStop(notice.stopId)
      if (arrived?.audioUrl) playNarration(arrived)
    }
  }, [notices, stops, playNarration, openStop])

  useEffect(() => {
    if (!position) return
    // Accuracy is passed in so a poor fix under canopy still counts as arriving.
    const newlyUnlocked = findNewlyUnlocked(position, stops, unlockedStopIds, accuracy)
    if (newlyUnlocked.length > 0) onUnlock(newlyUnlocked)
  }, [position, stops, unlockedStopIds, accuracy, onUnlock])

  const focusedStop = focusedStopId
    ? (stops.find((stop) => stop.id === focusedStopId) ?? null)
    : null

  // Warmer or colder, recomputed as the visitor moves.
  const huntDistance =
    sheetMode === 'hunt' && focusedStop && position ? distanceInMeters(position, focusedStop) : null

  useEffect(() => {
    if (huntDistance === null) return
    setHunt((previous) => nextHuntReading(previous, huntDistance))
  }, [huntDistance])

  const signposted = stops.filter((stop) => !stop.isMystery)
  const unlockedCount = signposted.filter((stop) => unlockedStopIds.includes(stop.id)).length

  return (
    <main className="tour">
      <header className="tour__bar">
        <div>
          <h1 className="tour__title">Winnemac Park Tour</h1>
          <p className="tour__count">
            {unlockedCount} of {signposted.length} stops unlocked
          </p>
        </div>
        <p className={`fix fix--${status}`}>
          {status === 'locating' && 'Finding you…'}
          {status === 'tracking' &&
            (accuracy && accuracy >= 1 ? `±${Math.round(accuracy)} m` : 'Following along')}
          {(status === 'denied' || status === 'error' || status === 'unsupported') && (
            <>
              <span className="fix__message">{message}</span>
              {(status === 'denied' || status === 'error') && (
                <button type="button" className="button button--small" onClick={retry}>
                  Try again
                </button>
              )}
            </>
          )}
        </p>
      </header>

      <div className="tour__stage">
        <div className="tour__map">
          <MapView stops={stops} unlockedStopIds={unlockedStopIds} position={position} />
        </div>

        <StopSheet
          stops={stops}
          progress={progress}
          position={position}
          mode={sheetMode}
          focusedStop={focusedStop}
          expanded={expanded}
          huntTrend={hunt.trend}
          huntDistance={huntDistance}
          onToggleExpanded={() => setExpanded((open) => !open)}
          onFocusStop={openStop}
          onBackToList={backToList}
          onRevealQuiz={onRevealQuiz}
          onPlayNarration={playNarration}
          onStartHunt={startHunt}
          onGiveUpHunt={backToList}
        />
      </div>

      {narration.track && (
        <NarrationBar
          track={narration.track}
          playing={narration.playing}
          blocked={narration.blocked}
          onToggle={narration.toggle}
          onStop={narration.stop}
        />
      )}

      {notices.length > 0 && (
        <div className={`notices ${narration.track ? 'notices--above-narration' : ''}`}>
          {notices.map((notice) => (
            <NoticeBanner key={notice.key} notice={notice} onDismiss={onDismissNotice} />
          ))}
        </div>
      )}
    </main>
  )
}
