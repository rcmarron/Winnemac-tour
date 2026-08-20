/** Minimal slice of the Storage API, so tests can pass a plain fake. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface Progress {
  /** The visitor tapped "Start" and granted (or was asked for) location. */
  started: boolean
  /** Stops walked into. Unlocking is permanent. */
  unlockedStopIds: string[]
}

const STORAGE_KEY = 'winnemac-tour:progress:v1'

export const emptyProgress = (): Progress => ({ started: false, unlockedStopIds: [] })

/**
 * localStorage throws in some privacy modes, so every access is guarded --
 * a visitor with storage blocked still gets a working tour, just no memory
 * of it between visits.
 */
function defaultStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Accepts anything; returns a Progress, falling back to empty on junk. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return emptyProgress()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return emptyProgress()
  }

  if (typeof parsed !== 'object' || parsed === null) return emptyProgress()

  const { started, unlockedStopIds } = parsed as Partial<Progress>

  return {
    started: started === true,
    unlockedStopIds: Array.isArray(unlockedStopIds)
      ? unlockedStopIds.filter((id): id is string => typeof id === 'string')
      : [],
  }
}

export function loadProgress(store: StorageLike | null = defaultStorage()): Progress {
  if (!store) return emptyProgress()
  try {
    return parseProgress(store.getItem(STORAGE_KEY))
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(
  progress: Progress,
  store: StorageLike | null = defaultStorage(),
): void {
  if (!store) return
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage full or blocked: the tour still works, it just won't persist.
  }
}
