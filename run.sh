#!/bin/bash
# ═══════════════════════════════════════════════════════
# OMEGA — Run Dev Server (API :3731 + UI :3732)
# ═══════════════════════════════════════════════════════

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"

mkdir -p "$REPO_DIR/.agent"

echo "═══════════════════════════════════════════════════"
echo " ▶  ${REPO_NAME} — DEV SERVER"
echo " $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo " API: http://localhost:3731"
echo " UI:  http://localhost:3732"
echo "═══════════════════════════════════════════════════"

cd "$REPO_DIR"

# Start API in background
cd api && npx tsx watch src/server.ts &
API_PID=$!

# Start UI in foreground
cd "$REPO_DIR/ui" && npx vite --host 2>&1

# If UI exits, also kill API
kill $API_PID 2>/dev/null || true
