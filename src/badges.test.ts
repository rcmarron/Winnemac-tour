import { describe, expect, it } from 'vitest'
import { earnedBadgeIds, findBadge } from './badges'
import type { Stop } from './types'

const stop = (overrides: Partial<Stop> & Pick<Stop, 'id'>): Stop => ({
  name: overrides.name ?? overrides.id,
  latitude: 41.975,
  longitude: -87.691,
  radius: 25,
  isMystery: false,
  text: 'Placeholder.',
  ...overrides,
})

const quizzed = (id: string): Stop =>
  stop({
    id,
    quiz: { question: `Question about ${id}?`, answer: 'Answer.' },
    countsForNaturalist: true,
  })

const progress = (unlocked: string[] = [], revealed: string[] = []) => ({
  unlockedStopIds: unlocked,
  revealedQuizStopIds: revealed,
})

describe('earnedBadgeIds', () => {
  it('awards nothing before the first unlock', () => {
    expect(earnedBadgeIds([quizzed('a'), quizzed('b')], progress())).toEqual([])
  })

  it('awards First Discovery on the first unlock', () => {
    const earned = earnedBadgeIds([stop({ id: 'a' }), stop({ id: 'b' })], progress(['a']))
    expect(earned).toContain('first-discovery')
  })

  it('awards Halfway There at half the signposted stops, rounding up', () => {
    const stops = [stop({ id: 'a' }), stop({ id: 'b' }), stop({ id: 'c' })]
    expect(earnedBadgeIds(stops, progress(['a']))).not.toContain('halfway-there')
    expect(earnedBadgeIds(stops, progress(['a', 'b']))).toContain('halfway-there')
  })

  it('withholds Park Naturalist while a stop is unvisited', () => {
    const stops = [quizzed('a'), quizzed('b')]
    expect(earnedBadgeIds(stops, progress(['a'], ['a', 'b']))).not.toContain('park-naturalist')
  })

  it('withholds Park Naturalist while a counted question is unseen', () => {
    const stops = [quizzed('a'), quizzed('b')]
    expect(earnedBadgeIds(stops, progress(['a', 'b'], ['a']))).not.toContain('park-naturalist')
  })

  it('awards Park Naturalist for every stop plus every counted question', () => {
    const stops = [quizzed('a'), quizzed('b')]
    expect(earnedBadgeIds(stops, progress(['a', 'b'], ['a', 'b']))).toContain('park-naturalist')
  })

  it('ignores quizzes that do not count toward Naturalist', () => {
    const bonus = stop({
      id: 'b',
      quiz: { question: 'Optional?', answer: 'Yes.' },
      countsForNaturalist: false,
    })
    const earned = earnedBadgeIds([quizzed('a'), bonus], progress(['a', 'b'], ['a']))
    expect(earned).toContain('park-naturalist')
  })

  it('does not let mystery stops hold back completion', () => {
    const stops = [quizzed('a'), stop({ id: 'secret', isMystery: true })]
    expect(earnedBadgeIds(stops, progress(['a'], ['a']))).toContain('park-naturalist')
  })

  it('counts a found mystery toward First Discovery', () => {
    const stops = [stop({ id: 'a' }), stop({ id: 'secret', isMystery: true })]
    expect(earnedBadgeIds(stops, progress(['secret']))).toContain('first-discovery')
  })
})

describe('findBadge', () => {
  it('finds a badge by id', () => {
    expect(findBadge('park-naturalist')?.name).toBe('Park Naturalist')
  })

  it('returns undefined for an unknown id', () => {
    expect(findBadge('nope')).toBeUndefined()
  })
})
