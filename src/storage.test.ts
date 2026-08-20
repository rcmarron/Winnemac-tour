import { beforeEach, describe, expect, it } from 'vitest'
import {
  emptyProgress,
  loadProgress,
  parseProgress,
  saveProgress,
  type StorageLike,
} from './storage'

class FakeStorage implements StorageLike {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('parseProgress', () => {
  it('returns empty progress for missing data', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
  })

  it('returns empty progress for malformed JSON', () => {
    expect(parseProgress('{ not json')).toEqual(emptyProgress())
  })

  it('drops non-string entries from unlockedStopIds', () => {
    const raw = JSON.stringify({ started: true, unlockedStopIds: ['oak', 7, null, 'elm'] })
    expect(parseProgress(raw)).toEqual({ started: true, unlockedStopIds: ['oak', 'elm'] })
  })

  it('treats a missing started flag as not started', () => {
    expect(parseProgress(JSON.stringify({ unlockedStopIds: [] })).started).toBe(false)
  })
})

describe('load and save', () => {
  let store: FakeStorage

  beforeEach(() => {
    store = new FakeStorage()
  })

  it('round-trips progress', () => {
    saveProgress({ started: true, unlockedStopIds: ['oak'] }, store)
    expect(loadProgress(store)).toEqual({ started: true, unlockedStopIds: ['oak'] })
  })

  it('reads empty progress from an untouched store', () => {
    expect(loadProgress(store)).toEqual(emptyProgress())
  })

  it('is a no-op when storage is unavailable', () => {
    expect(() => saveProgress({ started: true, unlockedStopIds: [] }, null)).not.toThrow()
    expect(loadProgress(null)).toEqual(emptyProgress())
  })

  it('survives a storage that throws on write', () => {
    const hostile: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota exceeded')
      },
    }
    expect(() => saveProgress({ started: true, unlockedStopIds: [] }, hostile)).not.toThrow()
  })
})
