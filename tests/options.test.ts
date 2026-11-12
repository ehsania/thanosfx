import { describe, expect, it } from "vitest";
import { effectDefaults, presetNames, presets, resolveEffectOptions } from "../src/core/options";

describe("effect defaults", () => {
  it("defines defaults for every effect", () => {
    expect(Object.keys(effectDefaults).sort()).toEqual(
      ["assemble", "burn", "pixelate", "ripple", "shatter", "shred"].sort(),
    );
  });

  it("keeps the target for assemble and ripple", () => {
    expect(effectDefaults.assemble.removeTarget).toBe(false);
    expect(effectDefaults.ripple.removeTarget).toBe(false);
    expect(effectDefaults.burn.removeTarget).toBe(true);
  });
});

describe("resolveEffectOptions", () => {
  it("merges effect defaults, presets and explicit options in order", () => {
    const resolved = resolveEffectOptions("burn", { duration: 800, density: 1.2 }, "chaos");
    expect(resolved.duration).toBe(800);
    expect(resolved.density).toBe(1.2);
    expect(resolved.gravity).toBe(presets.chaos.gravity);
  });

  it("exposes every preset by name", () => {
    for (const name of presetNames) {
      expect(presets[name]).toBeDefined();
    }
  });
});
