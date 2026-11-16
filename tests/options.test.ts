import { describe, expect, it } from "vitest";
import { effectDefaults, resolveEffectOptions } from "../src/core/options";

describe("effect defaults", () => {
  it("defines defaults for every effect", () => {
    expect(Object.keys(effectDefaults).sort()).toEqual(["assemble", "burn"]);
  });

  it("keeps the target for assemble", () => {
    expect(effectDefaults.assemble.removeTarget).toBe(false);
    expect(effectDefaults.burn.removeTarget).toBe(true);
  });

  it("leaves attraction off by default", () => {
    expect(effectDefaults.burn.attractTo).toBeNull();
    expect(effectDefaults.assemble.attractTo).toBeNull();
    expect(effectDefaults.burn.attractStrength).toBeGreaterThan(0);
  });
});

describe("resolveEffectOptions", () => {
  it("merges effect defaults and explicit options", () => {
    const resolved = resolveEffectOptions("burn", { duration: 800, density: 1.2 });
    expect(resolved.duration).toBe(800);
    expect(resolved.density).toBe(1.2);
    expect(resolved.gravity).toBe(effectDefaults.burn.gravity);
  });
});
