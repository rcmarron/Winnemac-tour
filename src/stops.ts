import type { Stop } from './types'

/**
 * Placeholder stops, positioned inside the park outline (see park.ts) so the
 * map reads correctly while the real list is being settled.
 *
 * The coordinates are approximations of plausible spots, not a survey: names,
 * exact positions, radii, quiz copy, and which stops are mysteries all still
 * need confirming with the Park Council. stops.test.ts keeps every stop and
 * its trigger zone inside the park.
 */
export const stops: Stop[] = [
  {
    id: 'entrance-oak',
    name: 'Foster Avenue Entrance',
    latitude: 41.97555,
    longitude: -87.68035,
    radius: 25,
    isMystery: false,
    text: 'Placeholder text for the entrance, where the tour begins.',
    quiz: {
      question: 'Roughly how old is the oak by the entrance?',
      answer: 'Placeholder answer — to be written with the Council.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'prairie-remnant',
    name: 'The Prairie Restoration',
    latitude: 41.97450,
    longitude: -87.68030,
    radius: 30,
    isMystery: false,
    text: 'Placeholder text for the restored prairie on the east side of the park.',
    // App-relative, so it survives the /Winnemac-tour/ base path.
    audioUrl: 'media/placeholder-narration.wav',
    quiz: {
      question: 'Why are prairie plants so deep-rooted?',
      answer: 'Placeholder answer — to be written with the Council.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'shagbark-hickory',
    name: 'Shagbark Hickory',
    latitude: 41.97495,
    longitude: -87.68165,
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
    id: 'ball-fields',
    name: 'The Ball Fields',
    latitude: 41.97320,
    longitude: -87.68140,
    radius: 30,
    isMystery: false,
    text: 'Placeholder text for the open fields at the south end.',
  },
  {
    id: 'leavitt-oaks',
    name: 'Leavitt Street Oaks',
    latitude: 41.97400,
    longitude: -87.68330,
    radius: 25,
    isMystery: false,
    text: 'Placeholder text for the oaks along the western path.',
  },
  // The five hidden stops. All of them sit on sanctioned paths -- unmarked, but
  // never off-trail into planting beds or anywhere unsafe.
  {
    id: 'mystery-1',
    name: 'Unknown',
    latitude: 41.97285,
    longitude: -87.68020,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Something waits where the path bends toward the south-east corner.',
    text: 'Placeholder text for the first mystery stop.',
  },
  {
    id: 'mystery-2',
    name: 'Unknown',
    latitude: 41.97530,
    longitude: -87.68280,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Near the north-west path, easy to walk straight past.',
    text: 'Placeholder text for the second mystery stop.',
  },
  {
    id: 'mystery-3',
    name: 'Unknown',
    latitude: 41.97350,
    longitude: -87.67990,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Along the eastern edge, where the city noise drops away.',
    text: 'Placeholder text for the third mystery stop.',
  },
  {
    id: 'mystery-4',
    name: 'Unknown',
    latitude: 41.97460,
    longitude: -87.68350,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Look low, on the western path, between the older trees.',
    text: 'Placeholder text for the fourth mystery stop.',
  },
  {
    id: 'mystery-5',
    name: 'Unknown',
    latitude: 41.97290,
    longitude: -87.68250,
    radius: 20,
    isMystery: true,
    mysteryHint: 'The quiet south-west corner keeps one more.',
    text: 'Placeholder text for the fifth mystery stop.',
  },
]
