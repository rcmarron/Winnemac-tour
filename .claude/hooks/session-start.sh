#!/bin/bash
# Installs dependencies so linting, tests, and the dev server work in Claude
# Code on the web sessions. Runs asynchronously: the session starts immediately
# while npm install finishes in the background. Safe to run repeatedly.
set -euo pipefail

# Only run in remote (web) sessions; local setups manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Must be the first thing on stdout: tells the session not to wait on us.
echo '{"async": true, "asyncTimeout": 300000}'

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

if [ ! -f package.json ]; then
  echo "session-start: no package.json, nothing to install" >&2
  exit 0
fi

echo "session-start: installing npm dependencies" >&2
# Send npm output to stderr: stdout must contain only the async directive above.
npm install --no-audit --no-fund >&2

echo "session-start: done" >&2
