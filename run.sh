#!/bin/bash
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$REPO_DIR/.agent"
echo " ▶  omega — DEV SERVER (API :3731 + UI :3732)"
cd "$REPO_DIR"
(cd api && npm run dev 2>&1) &
(cd ui && npm run dev 2>&1) &
wait
