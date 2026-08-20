import type { Stop } from './types'

/**
 * The tour's stops.
 *
 * Content is drawn from the Park Council's own prairie pages, the Chicago Park
 * District, Wikipedia's park and stadium histories, and Illinois Extension /
 * Illinois DNR on Royal Catchfly. Facts are researched; the coordinates are
 * not surveyed -- they place each stop in the right part of the park, and want
 * checking on foot. stops.test.ts keeps every stop and its trigger zone inside
 * the park and stops any two zones overlapping.
 */
export const stops: Stop[] = [
  {
    id: 'entrance-winamac',
    name: 'Winnemac: the Name',
    latitude: 41.97555,
    longitude: -87.68035,
    radius: 25,
    isMystery: false,
    text:
      'The park takes its name from Winnemac Street, which honours the Potawatomi chief Winamac. ' +
      'His name means catfish. He signed the Treaty of Greenville in 1795 and sided with the ' +
      'United States in the War of 1812. The park itself opened in 1910, on farmland the city ' +
      'leased from the Board of Education — it is older than either school beside it.',
    quiz: {
      question: 'Chief Winamac’s name means the name of an animal. Which one?',
      answer: 'A catfish.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'central-prairie',
    name: 'The Central Prairie',
    latitude: 41.97440,
    longitude: -87.68150,
    radius: 30,
    isMystery: false,
    text:
      'Three acres of native prairie in three sections, carrying more than sixty species of ' +
      'wildflower. The Council gives each prairie a Potawatomi name; this central one is ' +
      'Neshnabék. It was planted less than thirty years ago and is now among the most ' +
      'successful prairie restorations in Chicago — helped by something under your feet: most ' +
      'city parks were built on landfill, and this one was a farm.',
    // Placeholder narration, so the audio path is real; replace with a recording.
    audioUrl: 'media/placeholder-narration.wav',
    quiz: {
      question: 'Why does prairie take so well here, compared with other Chicago parks?',
      answer: 'This was farmland, not landfill. The soil was already deep and rich.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'royal-catchfly',
    name: 'The Flower That Needs a Hummingbird',
    latitude: 41.97480,
    longitude: -87.68090,
    radius: 20,
    isMystery: false,
    text:
      'Royal Catchfly grows here — scarlet, knee-high, and endangered in Illinois since 1980, ' +
      'nearly wiped out as prairie became farmland. It is one of the very few prairie flowers ' +
      'pollinated by a bird. Shut the ruby-throated hummingbird out and let every insect in, ' +
      'and the plant sets barely any seed. That red is an advertisement, and hummingbirds are ' +
      'the intended audience.',
    quiz: {
      question: 'Which visitor does Royal Catchfly depend on to set seed?',
      answer: 'The ruby-throated hummingbird.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'cup-plant',
    name: 'The Plant That Holds Rain',
    latitude: 41.97400,
    longitude: -87.68080,
    radius: 20,
    isMystery: false,
    text:
      'Cup Plant grows head-high here, and its paired leaves fuse right around the stem to make ' +
      'a bowl. Rain collects in it and sits there for days. Birds drink from those cups, insects ' +
      'fall in, and goldfinches work the seedheads later in the season. Look at where a leaf ' +
      'meets the stem after a wet morning.',
    quiz: {
      question: 'What collects in the join where a Cup Plant’s leaves meet the stem?',
      answer: 'Rainwater — enough for birds to drink from.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'blackbird-ground',
    name: 'Nests on the Ground',
    latitude: 41.97340,
    longitude: -87.68030,
    radius: 25,
    isMystery: false,
    text:
      'Red-winged blackbirds arrive back here in late February, ahead of almost everything else. ' +
      'They nest low — lashed to stems close to the ground rather than up in a tree — which is ' +
      'why a male will fly straight at your head in spring. He is not being unreasonable. It is ' +
      'also why the paths matter: a step into the grass in June can land on a nest you never saw.',
    quiz: {
      question: 'Why does a red-winged blackbird dive at people in spring?',
      answer: 'Its nest is at knee height in the grass, and you are standing next to it.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'fire-and-renewal',
    name: 'Why They Burn It',
    latitude: 41.97470,
    longitude: -87.68290,
    radius: 25,
    isMystery: false,
    text:
      'In March 2025 this ground was deliberately set alight, and the wildflowers came back ' +
      'stronger than before. Prairie is built for it: the plants keep most of themselves ' +
      'underground, in root systems that can run several metres deep, so fire clears the dead ' +
      'thatch and the invaders while the prairie itself sits it out below.',
    quiz: {
      question: 'How does a prairie survive being burned?',
      answer: 'Most of the plant is underground — deep roots that fire never reaches.',
    },
    countsForNaturalist: true,
  },
  {
    id: 'jorndt-stadium',
    name: 'Jorndt Field',
    latitude: 41.97370,
    longitude: -87.68300,
    radius: 30,
    isMystery: false,
    text:
      'The brick grandstand went up in the 1930s and seats 4,500. In 1956 it hosted the final of ' +
      'the National Challenge Cup — now the U.S. Open Cup, the oldest soccer competition in the ' +
      'country. Professional sides played here through the 1940s and 50s, and in 2005 Croatia’s ' +
      'under-21s met the Chicago Fire on this grass. It has been called Jorndt Field since 2004, ' +
      'for Louis C. Jorndt, who taught at Amundsen from 1930 to 1953.',
    quiz: {
      question: 'A national final was played here in 1956. In which sport?',
      answer: 'Soccer — the National Challenge Cup, now the U.S. Open Cup.',
    },
  },
  {
    id: 'schools-corner',
    name: 'The Park Came First',
    latitude: 41.97505,
    longitude: -87.67980,
    radius: 25,
    isMystery: false,
    text:
      'Amundsen High School was built in 1929, Chappell Elementary in 1937 — both on ground that ' +
      'had been park since 1910. The land stayed with the Board of Education for decades: the ' +
      'green space south of Winnemac Street only passed to the Park District in 1993, and ' +
      'another fourteen acres followed in 2001. In 1999 two million dollars went into the park, ' +
      'including the two hundred trees now shading these paths.',
    quiz: {
      question: 'Which arrived first here: the park or the high school?',
      answer: 'The park, by nineteen years — 1910 against 1929.',
    },
  },

  // The five hidden stops. All on sanctioned paths, unmarked but never off-trail.
  {
    id: 'mystery-milkweed',
    name: 'The Milkweed Patch',
    latitude: 41.97290,
    longitude: -87.68140,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Somewhere south, a plant that only one famous caterpillar will eat.',
    text:
      'Monarch caterpillars eat milkweed and nothing else, and the poison they take from it stays ' +
      'in them for life — which is why birds leave the adults alone. Look closely and you may ' +
      'find the freeloaders too: red milkweed beetles and large milkweed bugs, both wearing the ' +
      'same warning colours on the same plant.',
  },
  {
    id: 'mystery-goldfinch',
    name: 'The Late Nesters',
    latitude: 41.97420,
    longitude: -87.68220,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Where the seedheads stand, something waits until midsummer to raise a family.',
    text:
      'American goldfinches nest later than almost any other bird here, well into July and ' +
      'August. They wait for thistle and other composites to run to seed, then use the down to ' +
      'line the nest and the seed to feed the young. A late prairie is not a tired one — it is a ' +
      'goldfinch nursery.',
  },
  {
    id: 'mystery-childrens-prairie',
    name: 'The Children’s Prairie',
    latitude: 41.97520,
    longitude: -87.68170,
    radius: 20,
    isMystery: true,
    mysteryHint: 'One patch here was planted at knee height, on purpose.',
    text:
      'The Council names its prairies in Potawatomi, and this one is Pokagon — the Children’s ' +
      'Prairie, small and low and meant to be looked into rather than over. Alongside the main ' +
      'prairies sit pocket patches with names of their own: Massaw, Metea, Waubonsee, Bidagen, ' +
      'Widoktadwen.',
  },
  {
    id: 'mystery-willow',
    name: 'Where the Willow Stood',
    latitude: 41.97350,
    longitude: -87.68190,
    radius: 20,
    isMystery: true,
    mysteryHint: 'A gap in the middle of the park, where something large used to be.',
    text:
      'The big weeping willow that stood near here came down after about thirty years. That is ' +
      'not a failure — it is a willow. They grow fast, drink hard, and live thirty to fifty ' +
      'years, where an oak planted the same day would still be a youngster. Fast wood is soft ' +
      'wood, and soft wood does not last.',
  },
  {
    id: 'mystery-pocket-patch',
    name: 'A Pocket Patch',
    latitude: 41.97430,
    longitude: -87.68350,
    radius: 20,
    isMystery: true,
    mysteryHint: 'Along the western edge, a prairie small enough to miss entirely.',
    text:
      'Not every prairie here is a field. Small patches are tucked along the edges, each with its ' +
      'own name and its own seed list, planted and weeded by neighbours on the last Saturday of ' +
      'the month from May to November. Royal Catchfly, Queen of the Prairie, Culver’s Root, ' +
      'Cup Plant, Wild Bergamot: sixty species and rising, most of them put in by hand.',
  },
]
