import { stops } from './stops'

/** Placeholder shell -- the intro screen and GPS unlocking land in Phase 1. */
export function App() {
  const visible = stops.filter((stop) => !stop.isMystery)

  return (
    <main className="app">
      <h1>Winnemac Park Tour</h1>
      <p>Scaffold only. {visible.length} stops loaded, mysteries hidden.</p>
    </main>
  )
}
