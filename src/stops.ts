import type { Stop } from './types'

/**
 * Placeholder stops. Coordinates, radii, mystery picks, and media are all
 * still to be confirmed with the Park Council -- see the plan's open items.
 */
export const stops: Stop[] = [
  {
    id: 'entrance-oak',
    name: 'Entrance Oak',
    latitude: 41.9749,
    longitude: -87.6913,
    radius: 25,
    isMystery: false,
    text: 'Placeholder text for the first stop.',
  },
  {
    id: 'shagbark-hickory',
    name: 'Shagbark Hickory',
    latitude: 41.9756,
    longitude: -87.6899,
    radius: 25,
    isMystery: false,
    text: 'Placeholder text for the hickory stop.',
    quiz: {
      question: 'How did the shagbark hickory get its name?',
      answer: 'Its bark peels away in long, shaggy strips.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'mystery-1',
    name: 'Unknown',
    latitude: 41.9761,
    longitude: -87.6921,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Something waits where the path bends toward the water.',
    text: 'Placeholder text for a mystery stop.',
  },
]
