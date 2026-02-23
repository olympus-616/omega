#!/bin/bash
# ═══════════════════════════════════════════════════════
# OMEGA — Build Environment
# ═══════════════════════════════════════════════════════

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"

echo "═══════════════════════════════════════════════════"
echo " ⚒  ${REPO_NAME} — BUILD"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "═══════════════════════════════════════════════════"

cd "$REPO_DIR"
mkdir -p .agent

# ── Kill anything on ports 3731 / 3732 ───────────────
echo ""
echo "→ Clearing ports 3731 and 3732..."

for PORT in 3731 3732; do
  if command -v lsof &> /dev/null; then
    PID=$(lsof -ti :$PORT 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
      kill -9 $PID 2>/dev/null && echo "  ✓ Killed PID $PID on port $PORT" || true
    else
      echo "  · Port $PORT clear"
    fi
  elif command -v netstat &> /dev/null; then
    PID=$(netstat -ano 2>/dev/null | grep ":${PORT} " | grep LISTENING | awk '{print $5}' | head -1 || true)
    if [ -n "$PID" ] && [ "$PID" != "0" ]; then
      taskkill /F /PID "$PID" 2>/dev/null && echo "  ✓ Killed PID $PID on port $PORT" || true
    else
      echo "  · Port $PORT clear"
    fi
  else
    echo "  ⚠ Cannot check port $PORT (no lsof or netstat)"
  fi
done

# ── Install api deps ─────────────────────────────────
if [ -f "api/package.json" ]; then
  echo ""
  echo "→ Installing api/ dependencies..."
  cd api && npm install 2>&1 && cd ..
fi

# ── Install ui deps ──────────────────────────────────
if [ -f "ui/package.json" ]; then
  echo ""
  echo "→ Installing ui/ dependencies..."
  cd ui && npm install 2>&1 && cd ..
fi

# ── Report ───────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo " ✓ ${REPO_NAME} — BUILD COMPLETE"
echo " Ports 3731 + 3732 clear, dependencies installed"
echo "═══════════════════════════════════════════════════"
