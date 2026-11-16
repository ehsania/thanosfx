import type { EffectFactory, EffectName } from "../types";
import { createAssembleEffect } from "./assemble";
import { createBurnEffect } from "./burn";

export const effectFactories: Record<EffectName, EffectFactory> = {
  burn: (frame) => createBurnEffect(frame),
  assemble: createAssembleEffect,
};

export { createAssembleEffect, createBurnEffect };
