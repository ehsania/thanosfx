import type { EffectName, EffectOptions, ResolvedEffectOptions } from "./types";

const BASE_DEFAULTS: ResolvedEffectOptions = {
  duration: 1000,
  removeTarget: true,
  dpr: 0,
  reducedMotion: "auto",

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
  attractTo: null,
  attractStrength: 0.7,
  attractSwirl: 0.35,
};

export const effectDefaults: Record<EffectName, ResolvedEffectOptions> = {
  burn: { ...BASE_DEFAULTS, duration: 1700 },
  assemble: { ...BASE_DEFAULTS, duration: 1800, removeTarget: false },
};

export function resolveEffectOptions(
  effect: EffectName,
  options: EffectOptions,
): ResolvedEffectOptions {
  return { ...effectDefaults[effect], ...options } as ResolvedEffectOptions;
}
