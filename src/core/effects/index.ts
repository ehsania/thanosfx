import type { EffectFactory, EffectName } from "../types";
import { createAssembleEffect } from "./assemble";
import { createBurnEffect } from "./burn";
import { createPixelateEffect } from "./pixelate";
import { createRippleEffect } from "./ripple";
import { createShatterEffect } from "./shatter";
import { createShredEffect } from "./shred";

export const effectFactories: Record<EffectName, EffectFactory> = {
  burn: (frame) => createBurnEffect(frame),
  assemble: createAssembleEffect,
  ripple: createRippleEffect,
  shred: createShredEffect,
  shatter: createShatterEffect,
  pixelate: createPixelateEffect,
};

export {
  createAssembleEffect,
  createBurnEffect,
  createPixelateEffect,
  createRippleEffect,
  createShatterEffect,
  createShredEffect,
};
