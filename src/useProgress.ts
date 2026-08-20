import { useCallback, useEffect, useState } from 'react'
import { loadProgress, saveProgress, type Progress } from './storage'

/** Progress lives in localStorage on this one phone -- no accounts. */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const start = useCallback(() => {
    setProgress((prev) => (prev.started ? prev : { ...prev, started: true }))
  }, [])

  const unlock = useCallback((stopIds: readonly string[]) => {
    if (stopIds.length === 0) return

    setProgress((prev) => {
      const fresh = stopIds.filter((id) => !prev.unlockedStopIds.includes(id))
      if (fresh.length === 0) return prev
      return { ...prev, unlockedStopIds: [...prev.unlockedStopIds, ...fresh] }
    })
  }, [])

  return { progress, start, unlock }
}
