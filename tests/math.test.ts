import { describe, expect, it } from "vitest";
import { clamp, clamp01, easeInOutCubic, easeOutCubic, easeOutExpo, lerp } from "../src/core/math";

describe("math helpers", () => {
  it("clamps values", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-2, 0, 3)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
  });

  it("lerps", () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it("normalizes easing endpoints", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
  });
});
