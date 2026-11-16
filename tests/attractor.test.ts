import { describe, expect, it } from "vitest";
import { resolveAttractor } from "../src/core/attractor";

function fakeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("resolveAttractor", () => {
  it("keeps a point as-is", () => {
    expect(resolveAttractor({ x: 12, y: 34 })).toEqual({ x: 12, y: 34, radius: 0 });
    expect(resolveAttractor([12, 34])).toEqual({ x: 12, y: 34, radius: 0 });
  });

  it("uses the center and arrival radius of a rect", () => {
    const tuple = resolveAttractor([10, 20, 100, 50] as const)!;
    expect(tuple.x).toBe(60);
    expect(tuple.y).toBe(45);
    expect(tuple.radius).toBeCloseTo(25);

    const object = resolveAttractor({ left: 10, top: 20, width: 100, height: 50 })!;
    expect(object.x).toBe(60);
    expect(object.y).toBe(45);
    expect(object.radius).toBeCloseTo(25);
  });

  it("uses an element's bounding box", () => {
    const element = document.createElement("div");
    element.getBoundingClientRect = () => fakeRect(100, 200, 40, 80);
    const resolved = resolveAttractor(element)!;
    expect(resolved.x).toBe(120);
    expect(resolved.y).toBe(240);
    expect(resolved.radius).toBeCloseTo(20);
  });

  it("returns null when no target is provided", () => {
    expect(resolveAttractor(null)).toBeNull();
    expect(resolveAttractor(undefined)).toBeNull();
  });
});
