import { playEffect } from "./core/run";
import type { EffectHandle, EffectName, EffectOptions } from "./core/types";

export { playEffect } from "./core/run";
export { effectDefaults, resolveEffectOptions } from "./core/options";
export type {
  AttractorLike,
  EffectHandle,
  EffectName,
  EffectOptions,
  Point,
  Rect,
  RectLike,
} from "./core/types";

export const effectNames: readonly EffectName[] = ["burn", "assemble"];

function makeEffect(name: EffectName) {
  return (target: HTMLElement, options: EffectOptions = {}): EffectHandle =>
    playEffect(target, name, options);
}

export const burn = makeEffect("burn");
export const assemble = makeEffect("assemble");

export function createEffect(
  target: HTMLElement,
  effect: EffectName,
  options: EffectOptions = {},
): EffectHandle {
  return playEffect(target, effect, options);
}
