#!/bin/bash
# ═══════════════════════════════════════════════════════
# OLYMPUS-616 — God Agent Launch Script (permanent)
# ═══════════════════════════════════════════════════════
# Lives at: olympus-616/proteus/launch.1.7.x.x.sh
# Same file in all 27 god repos. NEVER changes.
#
# THIS IS THE GOD-LEVEL AGENT.
# It goes UP one level to olympus-616 so the agent can
# see sibling repos. The root has its own version of
# this script that stays in place.
# ═══════════════════════════════════════════════════════

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"
OLYMPUS_DIR="$(cd "$REPO_DIR/.." && pwd)"
OLYMPUS_NAME="$(basename "$OLYMPUS_DIR")"

if [[ "$OLYMPUS_NAME" != olympus-616* ]]; then
  echo "Error: Expected parent directory to start with olympus-616, got: $OLYMPUS_NAME"
  exit 1
fi

cd "$OLYMPUS_DIR" || exit 1

# ── Mode detection ────────────────────────────────────
OLYMPUS_MODE="${OLYMPUS_MODE:-reader}"
export OLYMPUS_MODE

if [[ "$OLYMPUS_MODE" == "author" ]]; then
  MODE_PROMPT="You are in AUTHOR MODE (\`OLYMPUS_MODE=author\`). You have full read and write access to source code within \`${REPO_NAME}/\`."
else
  MODE_PROMPT="You are in READER MODE (\`OLYMPUS_MODE=reader\`). You can run infrastructure (build.sh, run.sh) and read any file, but you MUST NOT create, edit, write, or delete source code files. If asked to modify code, explain that author mode is required and tell the user to run \`alchemisthomer.sh\`."
fi

PROMPT="You are the senior architecture and development agent in charge of the \`${REPO_NAME}\` folder within the \`${OLYMPUS_NAME}\` parent directory you are spawned in.

${MODE_PROMPT}

You will take my commands and build the appropriate solution within \`${REPO_NAME}/\` only — the other agents will manage those repos. However, you can read the code from the other repos within the \`${OLYMPUS_NAME}/\` folders as reference for patterns, shared interfaces, and architectural consistency.

Key rules:
- All file creation and modification happens inside \`${REPO_NAME}/\` only
- You may read any file in \`${OLYMPUS_NAME}/\` for context
- You may NOT write, delete, or modify files outside \`${REPO_NAME}/\`
- Follow the Mythic Forge design system conventions when applicable
- Commit messages use semantic format: type(${REPO_NAME}): description"

BOOT_COMMAND="Execute the following boot sequence for \`${REPO_NAME}\`:

1. Run \`bash ${REPO_NAME}/build.sh\` — this installs dependencies and validates the environment. Watch all output, capture any errors.

2. If build succeeds, run \`bash ${REPO_NAME}/run.sh\` in the background so the dev server starts and you can still receive my commands. Use: \`bash ${REPO_NAME}/run.sh &\` or \`nohup bash ${REPO_NAME}/run.sh > ${REPO_NAME}/.agent/run.log 2>&1 &\`

3. Report:
   - Build: pass/fail + any warnings
   - Server: running on which port, or failed with what error
   - Ready for commands: yes/no

If anything fails, diagnose and attempt to fix it. Then retry.

You are now online. The ${REPO_NAME} god awakens."

echo "⚡ ${REPO_NAME}"
echo "📂 ${OLYMPUS_DIR}"
echo "🔨 build.sh → run.sh"
echo "───────────────────────────────────────"

claude --dangerously-skip-permissions --append-system-prompt "$PROMPT" "$BOOT_COMMAND"