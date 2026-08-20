/** A quiz attached to a stop: one question, one revealed answer. */
export interface Quiz {
  question: string
  answer: string
}

/**
 * One point of interest on the tour. Every stop uses this same shape;
 * optional fields simply don't render when absent (no audioUrl -> no player).
 */
export interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  /** Trigger zone radius, in meters. */
  radius: number
  /** Hidden stop: not shown on the map, appears in the journal as a teaser. */
  isMystery: boolean
  /** Teaser shown in the journal before discovery. Only for mystery stops. */
  mysteryHint?: string
  text: string
  audioUrl?: string
  videoUrl?: string
  quiz?: Quiz
  /** Whether this stop's quiz counts toward the Park Naturalist badge. */
  countsForNaturalist?: boolean
}
