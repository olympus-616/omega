# omega

Ω **Omega** — Off Switch

> The final word.

## Architecture

- **API:** Express + TypeScript on port 3731 (`api/src/index.ts`)
- **UI:** Vite + React + Tailwind on port 3732 (`ui/src/App.tsx`)
- **Design System:** Aphrodite Mythic Forge (imported via preset)
- **Layer:** Infrastructure

## Commands

```bash
bash build.sh    # Install deps, clear ports
bash run.sh      # Start API + UI dev servers
```

## Git Workflow

- Branch: `brain/1.7.x.x` (main)
- Commits: `type(omega): description`
