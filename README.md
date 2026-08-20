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
