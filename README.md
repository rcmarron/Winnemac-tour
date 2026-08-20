# Winnemac Park Tour

A GPS-based, self-guided walking tour of Winnemac Park, delivered as a web app
and launched by scanning a QR code at the entrance.

## Getting started

```bash
npm install
npm run dev      # dev server
npm run lint     # eslint
npm run test     # vitest
npm run typecheck
npm run build
```

Node 20+ is expected (this repo is developed on Node 22).

## Claude Code on the web

`.claude/hooks/session-start.sh` runs on session start in remote sessions and
installs dependencies in the background so linting and tests work. It is a no-op
locally.

## Deployment

Pushing to `main` builds the site and deploys it to GitHub Pages via
`.github/workflows/deploy.yml`. The workflow runs lint, tests, and the build
first, so a broken commit fails before it can deploy.

Live URL: https://rcmarron.github.io/Winnemac-tour/

Because the site is served from a subpath, `vite.config.ts` sets
`base: '/Winnemac-tour/'`. Renaming the repository means updating that value.

One-time setup: in the repository's Settings -> Pages, set **Source** to
**GitHub Actions**.

## Phase 1 (current state)

The core loop works end to end: QR/link -> intro screen -> location permission ->
GPS unlocking -> text stops -> progress in local storage.

- `src/geo.ts` -- haversine distance and trigger-zone containment.
- `src/unlock.ts` -- pure logic: which stops a position unlocks, and which
  stops the visitor may see (mysteries stay hidden until found).
- `src/storage.ts` -- progress persisted to local storage, tolerant of blocked
  or full storage.
- `src/useGeolocation.ts` -- `watchPosition` wrapper, including denied and
  unsupported states.
- `src/useProgress.ts` -- unlocking is permanent; revisiting is always free.

## Phase 2 (current state)

The game layer sits on top of Phase 1:

- **Journal** -- every stop is listed, always. Locked stops show how far away
  they are; undiscovered mysteries show as `???` plus their hint.
- **Quizzes** (`src/badges.ts` consumes them) -- optional per stop, revealed on
  a tap.
- **Badges** -- First Discovery, Halfway There, and Park Naturalist, all
  re-derived from what the visitor has done, so a badge can never be lost.
- **Celebration** (`src/celebrate.ts`) -- an on-screen banner for everyone, a
  Web Audio chime, and `navigator.vibrate` where it exists. Audio is primed by
  the Start tap, since browsers only allow sound to begin from a gesture.

## Map view

The tour opens on a map, because the visitor's first question is where to
walk. Leaflet with OpenStreetMap tiles: no API key, and the park's paths are
already mapped. Attribution is required and is rendered by the map.

- Signposted stops are pins, each inside its trigger zone: dashed grey while
  locked, solid green once unlocked, so arriving is legible even when the
  visitor's own dot sits on the pin.
- Mystery stops are deliberately absent from the map (`mapPins` filters them);
  the journal teases them instead.
- The header names the nearest stop still to unlock and how far it is.
- Tiles need a data connection. GPS itself works offline, so with no signal
  unlocking still works -- the basemap is simply blank under the pins.

Still to come: the five mystery stops and the Keen Eye badge, plus audio and
video (Phase 3), and the donation link (Phase 4). Stop coordinates and quiz
copy in `src/stops.ts` are placeholders.
