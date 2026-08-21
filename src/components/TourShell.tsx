import { useCallback, useEffect, useRef, useState } from 'react'
import { HuntPanel } from './HuntPanel'
import { MapView } from './MapView'
import { Modal } from './Modal'
import { NarrationBar } from './NarrationBar'
import { NoticeBanner } from './NoticeBanner'
import { StopDetail } from './StopDetail'
import { StopSheet } from './StopSheet'
import { useGeolocation } from '../useGeolocation'
import { useNarration } from '../useNarration'
import { findNewlyUnlocked } from '../unlock'
import { distanceInMeters } from '../geo'
import { initialHuntReading, nextHuntReading, type HuntReading } from '../hunt'

/** What the modal is showing, if anything. */
type ModalView = { kind: 'stop'; stopId: string } | { kind: 'hunt'; stopId: string } | null
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
  const [modal, setModal] = useState<ModalView>(null)
  const [hunt, setHunt] = useState<HuntReading>(initialHuntReading)
  const { status, position, accuracy, message, retry } = useGeolocation(true)
  const narration = useNarration(import.meta.env.BASE_URL)
  const { unlockedStopIds } = progress

  const playNarration = useCallback(
    (stop: Stop) => {
      if (!stop.audioUrl) return

      // Already this stop's track: the modal covers the narration bar, so the
      // same button has to be able to pause it.
      if (narration.track?.stopId === stop.id) {
        narration.toggle()
        return
      }

      narration.start({ stopId: stop.id, name: stop.name, audioUrl: stop.audioUrl })
    },
    [narration],
  )

  const openStop = useCallback((stopId: string) => {
    setModal({ kind: 'stop', stopId })
  }, [])

  const startHunt = useCallback((stopId: string) => {
    setModal({ kind: 'hunt', stopId })
    setHunt(initialHuntReading)
  }, [])

  const closeModal = useCallback(() => {
    setModal(null)
    setHunt(initialHuntReading)
  }, [])

  // Read inside the arrival effect without making it re-run on every change.
  const modalRef = useRef(modal)
  modalRef.current = modal

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
        modalRef.current?.kind === 'hunt' && modalRef.current.stopId !== notice.stopId

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

  const modalStop = modal ? (stops.find((stop) => stop.id === modal.stopId) ?? null) : null

  // Warmer or colder, recomputed as the visitor moves.
  const huntDistance =
    modal?.kind === 'hunt' && modalStop && position
      ? distanceInMeters(position, modalStop)
      : null

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
          expanded={expanded}
          onToggleExpanded={() => setExpanded((open) => !open)}
          onOpenStop={openStop}
          onRevealQuiz={onRevealQuiz}
          onPlayNarration={playNarration}
          onStartHunt={startHunt}
        />
      </div>

      {modal?.kind === 'stop' && modalStop && (
        // The card carries its own heading, so the modal's is for screen
        // readers only.
        <Modal title={modalStop.name} titleHidden onClose={closeModal}>
          <StopDetail
            stop={modalStop}
            unlocked={unlockedStopIds.includes(modalStop.id)}
            quizRevealed={progress.revealedQuizStopIds.includes(modalStop.id)}
            narrationPlaying={narration.track?.stopId === modalStop.id && narration.playing}
            position={position}
            onRevealQuiz={onRevealQuiz}
            onPlayNarration={playNarration}
            onStartHunt={startHunt}
          />
        </Modal>
      )}

      {modal?.kind === 'hunt' && modalStop && (
        <Modal title="Hunting a hidden stop" titleHidden onClose={closeModal}>
          <HuntPanel
            hint={modalStop.mysteryHint ?? 'Somewhere along the paths.'}
            trend={hunt.trend}
            distanceMeters={huntDistance}
            onGiveUp={closeModal}
          />
        </Modal>
      )}

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
