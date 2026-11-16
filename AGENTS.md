# ThanosFx repository guide

This file is for agents working on the ThanosFx repository. For library usage and API details, read [`llms.txt`](./llms.txt).

## Stack

- TypeScript
- Vite for the demo
- tsup for the library build
- Vitest for tests
- ESLint and Prettier

## Commands

```sh
npm install
npm run dev        # demo at http://localhost:5173/
npm run verify     # format, lint, typecheck and tests
npm run build      # library + demo
npm run build:lib
npm run build:demo
npm test
```

## Layout

- `src/` — the library.
- `src/core/` — capture, WebGL, options, effects and the run loop.
- `src/core/effects/burn.ts` — burn particles, collision and attraction.
- `src/core/effects/assemble.ts` — burn played backwards.
- `demo/` — the single-page site.
- `demo/quickstart.ts` — agent prompt panels.
- `demo/recycle.ts` — live task-list demo.
- `demo/tuner.ts` — controls and generated code.
- `demo/video/` — development-only video capture harness.
- `tests/` — Vitest tests.
- `llms.txt` — agent-facing library guide.
- `demo/public/media/` — demo videos and posters.

## Product constraints

- Only two effects: `burn` and `assemble`.
- No preset system.
- One demo page. Do not split the landing page and playground.
- The Quick Start section is framework-agnostic.
- Keep the page theme-aware and accessible.
- WebGL2 is required. Reduced motion falls back to a short fade.
- Keep runtime dependencies at zero.
- The video capture harness is not part of the production build.
- GitHub Pages is served from `/thanosfx/` via `VITE_BASE_PATH`.

## Before finishing

Run:

```sh
npm run verify
npm run build
```

Check the light and dark themes, desktop and mobile layouts, the Quick Start copy buttons, and the live demo.
