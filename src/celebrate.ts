/**
 * The unlock moment: a chime, a buzz where supported, and (in the UI) a
 * banner. Safari on iPhone has no web vibration, so the buzz is a bonus --
 * the sound and the banner carry the moment for everyone.
 */

let audio: AudioContext | null = null
let lastPlayedAt = 0

/**
 * Browsers only allow audio to start from a user gesture, so this is called
 * when the visitor taps "Start" -- long before the first unlock.
 */
export function primeCelebration(): void {
  if (audio) return
  try {
    audio = new AudioContext()
  } catch {
    audio = null
  }
}

function chime(): void {
  if (!audio) return

  // Two rising notes: a small "found it" flourish rather than a UI blip.
  const now = audio.currentTime
  for (const [index, frequency] of [587.33, 880].entries()) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    const start = now + index * 0.12
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

    oscillator.connect(gain).connect(audio.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.4)
  }
}

/** Fires the sound and buzz. Rate-limited so simultaneous unlocks don't stack. */
export function celebrate(): void {
  const now = Date.now()
  if (now - lastPlayedAt < 400) return
  lastPlayedAt = now

  try {
    void audio?.resume()
    chime()
  } catch {
    // No audio available: the banner still shows.
  }

  try {
    navigator.vibrate?.([40, 60, 40])
  } catch {
    // Vibration unsupported (every iPhone): also fine.
  }
}
