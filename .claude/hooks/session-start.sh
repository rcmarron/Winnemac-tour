#!/bin/bash
# Installs dependencies so linting, tests, and the dev server work as soon as a
# Claude Code on the web session starts. Safe to run repeatedly.
set -euo pipefail

# Only run in remote (web) sessions; local setups manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

if [ ! -f package.json ]; then
  echo "session-start: no package.json, nothing to install" >&2
  exit 0
fi

echo "session-start: installing npm dependencies" >&2
npm install --no-audit --no-fund

echo "session-start: done" >&2
