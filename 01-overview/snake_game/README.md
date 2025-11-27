# Snake — Codex Edition

A small React + Vite project that showcases a modern take on the classic Snake game. It ships with a responsive board, scoreboard, multiple speed presets, and on-screen controls for touch devices.

## Getting started

```bash
npm install
npm run dev    # start Vite on http://localhost:5173
```

Additional scripts:

- `npm run build` — bundle the production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint with the included config

## Gameplay notes

- Use the arrow keys or the touch pad to change the snake direction (no instant turn-backs allowed).
- Pick from the Chill, Classic, or Turbo speed profiles; pause the run if you want to switch mid-game.
- Choose between **Wall** (classic) and **Pass-through** modes. Pass-through lets the snake wrap around the board edges instead of crashing.
- Keep an eye on the scoreboard — the current and best scores are stored locally between sessions.
