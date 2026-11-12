import { playEffect } from "./core/run";
import type { PlayEffectOptions } from "./core/run";
import type { EffectHandle, EffectName } from "./core/types";

export { playEffect } from "./core/run";
export type { PlayEffectOptions } from "./core/run";
export { effectDefaults, presetNames, presets, resolveEffectOptions } from "./core/options";
export type { PresetName } from "./core/options";
export { effectFactories } from "./core/effects";
export { easeInOutCubic, easeOutCubic, easeOutExpo, lerp, clamp01 } from "./core/math";
export type {
  EffectFrame,
  EffectHandle,
  EffectInstance,
  EffectName,
  EffectOptions,
  Rect,
  RectLike,
} from "./core/types";

export const effectNames: EffectName[] = [
  "burn",
  "assemble",
  "ripple",
  "shred",
  "shatter",
  "pixelate",
];

function makeEffect(name: EffectName) {
  return (target: HTMLElement, options: PlayEffectOptions = {}): EffectHandle =>
    playEffect(target, name, options);
}

export const burn = makeEffect("burn");
export const assemble = makeEffect("assemble");
export const ripple = makeEffect("ripple");
export const shred = makeEffect("shred");
export const shatter = makeEffect("shatter");
export const pixelate = makeEffect("pixelate");

export function createEffect(
  target: HTMLElement,
  effect: EffectName,
  options: PlayEffectOptions = {},
): EffectHandle {
  return playEffect(target, effect, options);
}
