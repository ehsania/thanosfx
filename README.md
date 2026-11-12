# ThanosFx

[![npm version](https://img.shields.io/npm/v/thanosfx.svg)](https://www.npmjs.com/package/thanosfx)
[![license](https://img.shields.io/npm/l/thanosfx.svg)](./LICENSE)
[![zero dependencies](https://img.shields.io/badge/runtime_dependencies-0-brightgreen.svg)](./package.json)

WebGL effects that burn, ripple, shred, shatter and reassemble DOM elements.

- **Burn** — the element turns to carbon and falls away as ash.
- **Assemble** — burn played backwards; dust gathers into the element.
- **Ripple** — a radial wave bends the element and settles back.
- **Shred** — the element is cut into strips and pulled apart.
- **Shatter** — a grid of fragments spins outward and falls.
- **Pixelate** — the element quantizes into blocks and dissolves.

Every effect captures the real DOM element as a texture, draws it on a
full-screen WebGL2 overlay, and animates it with a GPU shader. The browser keeps
rendering text, borders, gradients and images exactly as they appear on the page.

## Install

```sh
npm install thanosfx
```

React is optional and only needed for the `thanosfx/react` entry point:

```sh
npm install react
```

## Quick start

```ts
import { burn } from "thanosfx";

const card = document.querySelector<HTMLElement>(".card");
if (!card) throw new Error("Missing .card");

const handle = burn(card, {
  duration: 1700,
  density: 0.9,
  gravity: 3200,
  spread: 210,
});

handle.promise.then(() => {
  console.log("gone");
});
```

`burn`, `assemble`, `ripple`, `shred`, `shatter` and `pixelate` share the same
one-shot API.

```ts
import { createEffect } from "thanosfx";

createEffect(card, "shatter", {
  duration: 1350,
  grid: 12,
  spread: 340,
  spin: 1.4,
});
```

## Options

```ts
interface EffectOptions {
  duration?: number; // ms
  removeTarget?: boolean; // defaults depend on effect
  reducedMotion?: "auto" | "allow" | "reduce";
  dpr?: number;

  // burn / assemble
  burnMs?: number;
  density?: number;
  gravity?: number;
  bounce?: number;
  spread?: number;
  life?: number;
  friction?: number;
  lift?: number;
  particleScale?: number;
  embers?: boolean;
  collision?: boolean;
  mode?: "sweep" | "instant";
  collideWith?: RectLike[]; // elements or rects to bounce off

  // ripple
  amplitude?: number;
  frequency?: number;
  speed?: number;
  decay?: number;

  // shred
  strips?: number;
  twist?: number;

  // shatter
  grid?: number;
  spin?: number;

  // pixelate
  pixels?: number;
  dissolve?: number;
}
```

Presets: `default`, `soft`, `ash`, `chaos`, `quick`, `cinematic`.

```ts
burn(card, { preset: "chaos" });
```

## React

```tsx
import { useRef } from "react";
import { useThanosFx } from "thanosfx/react";
import type { EffectName } from "thanosfx";

export function DeleteCard({ effect }: { effect: EffectName }) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useThanosFx(ref, effect, { duration: 1700 });

  return (
    <div ref={ref}>
      <button onClick={play}>Delete</button>
    </div>
  );
}
```

## How it works

1. **Capture** — the element is rasterized to a canvas via an SVG
   `foreignObject` snapshot. `html2canvas` is used automatically if present.
2. **Texture** — the canvas is uploaded to a WebGL2 texture with
   `UNPACK_FLIP_Y_WEBGL`.
3. **Render** — an effect shader draws a quad over the element's screen rect.
   Burn also draws a point-sprite particle system.
4. **Cleanup** — after the effect, the overlay and GPU resources are released
   and the element is removed (or restored for ripple/assemble).

Reduced motion falls back to a short opacity fade. WebGL2 is required.

## Development

```sh
npm install
npm run dev        # landing page + playground
npm test
npm run typecheck
npm run build
```

- `/` — landing page
- `/playground/` — live controls and code generation

## License

MIT
