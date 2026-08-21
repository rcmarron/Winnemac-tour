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

## Layout: map above, stops below

One screen, no tabs. The map holds the top half; a sheet below it lists the
stops closest to the visitor, re-sorting as they walk. "See all" slides the
sheet up over the map to show the full journal, and "Show map" drops it back.

The map's layers are created once and edited in place -- markers get a new icon
only when a stop unlocks, and the visitor's dot is an SVG circle that moves
rather than a div icon Leaflet rebuilds on every move. Recentring ignores
movement under 4 m (`RECENTRE_THRESHOLD_M`), so a phone's twitch while standing
still doesn't drag the map around.

The map follows the visitor: it centres on them from the first fix and keeps
centred as they walk. Dragging or zooming by hand hands control back (the
button changes from "Following you" to "Centre on me", which resumes it). The
follow zoom is chosen to hold the next stop in frame, clamped between 14 and
17, since a map centred on you with nothing else in view does not help you
decide where to walk.

The map is sized to the top half rather than the whole stage, so Leaflet frames
stops into space the visitor can actually see instead of behind the sheet.
`nearestStops` leaves undiscovered mysteries out of the closest list: a
distance would point straight at one and spoil the find.

Leaflet with OpenStreetMap tiles: no API key, and the park's paths are
already mapped. Attribution is required and is rendered by the map.

- Signposted stops are pins, each inside its trigger zone: dashed grey while
  locked, solid green once unlocked, so arriving is legible even when the
  visitor's own dot sits on the pin.
- Mystery stops are deliberately absent from the map (`mapPins` filters them);
  the journal teases them instead.
- Tiles need a data connection. GPS itself works offline, so with no signal
  unlocking still works -- the basemap is simply blank under the pins.

## Stop coordinates

`src/park.ts` holds the park outline taken from OpenStreetMap way 27860785 --
the same data the basemap is drawn from, so stops and paths agree. It is
bounded by Foster Ave, Damen Ave, Argyle St and Leavitt St, about 400 m square.

The stops in `src/stops.ts` sit inside that outline. Their content is
researched (sources below); their coordinates are not surveyed -- they place
each stop in the right part of the park and want checking on foot.
`stops.test.ts` guards the geography: every stop, and its whole trigger zone,
must fall inside the park, no two zones may overlap, and every mystery must
carry a hint.

Sources for the stop content:

- Winnemac Park Advisory Council, "Our Prairies" -- the Potawatomi prairie
  names, the species list, stewardship.
- Chicago Park District, Winnemac Park Natural Area -- three acres, three
  sections.
- Wikipedia, Winnemac Park and Winnemac Stadium -- chief Winamac, 1910
  founding, the schools, the 1999 renovation, the 1956 National Challenge Cup
  final, Jorndt Field.
- Illinois Extension and Illinois DNR on Royal Catchfly (*Silene regia*) --
  state-endangered since 1980, pollinated by the ruby-throated hummingbird.

## Phase 3 (current state)

- **Five hidden stops**, teased in the journal as `???` with a hint each, and
  absent from the map -- found or not -- so discovery stays a discovery.
- **Keen Eye**, awarded for finding all five. It does not wait on the
  signposted stops, and the signposted count ignores mysteries, so the two
  strands never hold each other back.
- **Narration** (`useNarration.ts`) -- one player for the whole tour, started
  automatically on arrival at a stop that has audio. Browsers block audio no
  gesture asked for, so a refused autoplay leaves the bar up with a play
  button rather than failing silently.
- **Video** (`VideoEmbed.tsx`) -- YouTube links are converted to privacy-mode
  embeds; a link we cannot parse renders as a plain link, never a broken
  player. No stop carries a video yet: add a `videoUrl` when there is real
  footage.

`public/media/placeholder-narration.wav` is a two-tone stand-in so the audio
path is real and testable. Replace it with the Council's recordings.

## Arriving, and hunting

Arriving at a stop opens its card in a modal, with the text, narration and quiz
right there. Rows in the closest list are buttons that open the same modal, so
content is always one tap away rather than behind the full journal.

The modal is a native `<dialog>` (`Modal.tsx`), so Escape, focus trapping, the
backdrop and taking the page behind it out of the tab order all come from the
browser. It closes on Escape, on the close button, and on a tap outside. A
dialog sits in the top layer, above the narration bar, so the card carries its
own play/pause control for the stop it is showing.

Unlocking allows for the reported GPS accuracy, capped at 20 m
(`MAX_ACCURACY_ALLOWANCE_M`). Under summer canopy a phone often reports a
20-30 m accuracy circle, and a visitor standing at a stop can be placed outside
a 20 m zone -- arriving and having nothing happen is the worst failure this app
has.

Undiscovered mysteries can be hunted, in the same modal: `hunt.ts` reports
warmer or colder plus
a coarse proximity band, never a distance or a bearing, and treats movement
under 6 m as GPS noise so the verdict doesn't flap while standing still. An
arrival at some *other* stop does not end a hunt in progress; finding the
hunted stop does, with the reveal.

## Phase 4: supporting the park

Once Park Naturalist is earned, the journal opens with a finish panel and a
"Support the Park" link to the Council's own SwipeSimple page
(`src/donation.ts`). It appears only at the finish -- not as a standing ask over
someone's walk -- and stays available afterwards so a visitor can give later.

The app never handles money: no form, no card fields, no request to the payment
host. It is a plain outbound link, opened in a new tab with `rel="noreferrer"`,
and the panel says where it goes before you tap it. Tests assert the URL is the
Council's https page and that the app makes no request to it.

Still outstanding: stop names, exact positions, radii, quiz copy, and all media
need confirming with the Park Council.
