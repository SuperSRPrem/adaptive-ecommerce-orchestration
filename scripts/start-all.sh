#!/usr/bin/env bash
# Bash startup script for Linux and macOS environments
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$(dirname "$DIR")"

echo "=============================================================================="
echo "[SearchLab] Launching Complete Research Platform (Linux/macOS)"
echo "=============================================================================="

# Launch backend in background
echo "1. Starting FastAPI Backend on http://localhost:8000 ..."
cd "$ROOT_DIR/backend"
python3 -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 3

# Launch frontend in foreground
echo "2. Starting Vite Frontend on http://localhost:5173 ..."
cd "$ROOT_DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 5173

# Trap exit to cleanup background backend process
trap "kill $BACKEND_PID" EXIT
