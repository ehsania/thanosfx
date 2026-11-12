import type { EffectFrame, EffectInstance } from "../types";
import { createBurnEffect } from "./burn";

/**
 * Assemble is Burn played backwards: dust rises from the floor and gathers
 * into the element, which becomes visible at the end.
 */
export function createAssembleEffect(frame: EffectFrame): EffectInstance {
  return createBurnEffect(frame, true);
}
