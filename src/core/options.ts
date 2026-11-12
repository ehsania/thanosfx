import type { EffectName, EffectOptions, ResolvedEffectOptions } from "./types";

const BASE_DEFAULTS: ResolvedEffectOptions = {
  duration: 1000,
  removeTarget: true,
  dpr: 0,
  reducedMotion: "auto",
  pointer: { x: 0.5, y: 0.5 },

  burnMs: 200,
  density: 0.9,
  gravity: 3200,
  bounce: 0.32,
  spread: 210,
  life: 1,
  friction: 0.66,
  lift: 190,
  particleScale: 1,
  embers: true,
  collision: true,
  mode: "sweep",
  collideWith: [],

  amplitude: 22,
  frequency: 34,
  speed: 18,
  decay: 4.5,

  strips: 18,
  twist: 0.5,

  grid: 10,
  spin: 1.4,

  pixels: 34,
  dissolve: 1,
  tint: 0,
};

export const effectDefaults: Record<EffectName, ResolvedEffectOptions> = {
  burn: { ...BASE_DEFAULTS, duration: 1700 },
  assemble: { ...BASE_DEFAULTS, duration: 1800, removeTarget: false },
  ripple: {
    ...BASE_DEFAULTS,
    duration: 900,
    removeTarget: false,
  },
  shred: {
    ...BASE_DEFAULTS,
    duration: 1200,
    strips: 18,
    spread: 280,
    gravity: 1400,
    twist: 0.5,
  },
  shatter: {
    ...BASE_DEFAULTS,
    duration: 1350,
    grid: 10,
    spread: 340,
    gravity: 1600,
    spin: 1.4,
  },
  pixelate: {
    ...BASE_DEFAULTS,
    duration: 1000,
    pixels: 34,
    dissolve: 1,
  },
};

export const presets = {
  default: {},
  soft: { duration: 2200, gravity: 1800, spread: 140, lift: 240, density: 0.7 },
  ash: { duration: 1700, density: 0.9, gravity: 3200, spread: 210, lift: 190 },
  chaos: { duration: 1400, gravity: 4400, spread: 380, bounce: 0.55, density: 1.25 },
  quick: { duration: 600, burnMs: 120 },
  cinematic: { duration: 2800, gravity: 900, spread: 320, lift: 270, density: 1.1 },
} satisfies Record<string, EffectOptions>;

export type PresetName = keyof typeof presets;

export const presetNames = Object.keys(presets) as PresetName[];

export function resolveEffectOptions(
  effect: EffectName,
  options: EffectOptions,
  preset: PresetName = "default",
): ResolvedEffectOptions {
  return {
    ...effectDefaults[effect],
    ...presets[preset],
    ...options,
  } as ResolvedEffectOptions;
}
