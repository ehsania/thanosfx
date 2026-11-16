import { describe, expect, it } from "vitest";
import { clamp, clamp01 } from "../src/core/math";

describe("math helpers", () => {
  it("clamps values", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-2, 0, 3)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(1.4)).toBe(1);
  });
});
