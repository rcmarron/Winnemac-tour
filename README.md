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
installs dependencies so linting and tests work immediately. It is a no-op
locally.
