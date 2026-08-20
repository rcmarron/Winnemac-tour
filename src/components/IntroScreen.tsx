interface IntroScreenProps {
  stopCount: number
  onStart: () => void
}

export function IntroScreen({ stopCount, onStart }: IntroScreenProps) {
  return (
    <main className="screen screen--intro">
      <p className="eyebrow">Winnemac Park Council</p>
      <h1>A walking tour of the park</h1>
      <p className="lede">
        {stopCount} stops are waiting along the paths. Walk up to one and it unlocks &mdash; its story
        is yours to keep, and you can read it again any time.
      </p>
      <button type="button" className="button" onClick={onStart}>
        Start the tour
      </button>
      <p className="fine-print">
        We&rsquo;ll ask to use your location to know when you&rsquo;ve arrived at a stop. Nothing
        leaves your phone.
      </p>
    </main>
  )
}
