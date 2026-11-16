import type { EffectOptions } from "thanosfx";

export type ParticleMode = "collision" | "attract" | "dissolve";

export interface RecycleSettings {
  burnMs: number;
  duration: number;
  density: number;
  gravity: number;
  spread: number;
  life: number;
  lift: number;
  bounce: number;
  friction: number;
  particleScale: number;
  embers: boolean;
  burnMode: "sweep" | "instant";
  attractStrength: number;
  attractSwirl: number;
  respectReducedMotion: boolean;
}

export const defaultRecycleSettings: RecycleSettings = {
  burnMs: 230,
  duration: 1700,
  density: 0.65,
  gravity: 3000,
  spread: 140,
  life: 1.45,
  lift: 100,
  bounce: 0.58,
  friction: 0.7,
  particleScale: 1,
  embers: true,
  burnMode: "sweep",
  attractStrength: 0.9,
  attractSwirl: 0.3,
  respectReducedMotion: true,
};

export function createRecycleSettings(): RecycleSettings {
  return { ...defaultRecycleSettings };
}

export const MODE_CAPTION: Record<ParticleMode, string> = {
  collision: "Collision: dust falls onto the cards below.",
  attract: "Attract: dust spirals into the bin.",
  dissolve: "Dissolve: low gravity, no collisions. Dust drifts away.",
};

function baseOptions(settings: RecycleSettings): EffectOptions {
  return {
    duration: settings.duration,
    burnMs: settings.burnMs,
    density: settings.density,
    gravity: settings.gravity,
    spread: settings.spread,
    life: settings.life,
    lift: settings.lift,
    bounce: settings.bounce,
    friction: settings.friction,
    particleScale: settings.particleScale,
    embers: settings.embers,
    mode: settings.burnMode,
    removeTarget: false,
    reducedMotion: settings.respectReducedMotion ? "auto" : "allow",
  };
}

export function burnOptions(
  mode: ParticleMode,
  settings: RecycleSettings,
  collideWith: HTMLElement[],
  attractor: HTMLElement | null,
): EffectOptions {
  const base = baseOptions(settings);

  if (mode === "collision") {
    return { ...base, collision: true, collideWith };
  }

  if (mode === "attract") {
    return {
      ...base,
      density: settings.density * 0.55,
      particleScale: settings.particleScale * 0.85,
      collision: false,
      gravity: settings.gravity * 0.18,
      spread: settings.spread * 0.65,
      lift: settings.lift * 0.4,
      life: settings.life * 1.05,
      attractTo: attractor,
      attractStrength: settings.attractStrength,
      attractSwirl: settings.attractSwirl,
    };
  }

  return {
    ...base,
    collision: false,
    gravity: settings.gravity * 0.14,
    spread: settings.spread * 1.5,
    lift: settings.lift * 1.8,
    life: settings.life * 1.15,
  };
}

export function assembleOptions(
  settings: RecycleSettings,
  source: HTMLElement | null,
): EffectOptions {
  return {
    ...baseOptions(settings),
    density: settings.density * 0.55,
    gravity: settings.gravity * 0.18,
    spread: settings.spread * 0.65,
    life: settings.life * 1.05,
    lift: settings.lift * 0.4,
    particleScale: settings.particleScale * 0.85,
    collision: false,
    attractTo: source,
    attractStrength: Math.max(0.8, settings.attractStrength),
    attractSwirl: settings.attractSwirl,
  };
}
