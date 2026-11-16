import type { AttractorLike } from "./types";

export interface ResolvedAttractor {
  /** Center point in CSS pixels. */
  x: number;
  y: number;
  /** Arrival radius in CSS pixels; particles spread across this area. */
  radius: number;
}

const MAX_ARRIVAL_RADIUS = 48;

function isElement(value: unknown): value is Element {
  return typeof Element !== "undefined" && value instanceof Element;
}

function fromRect(x: number, y: number, width: number, height: number): ResolvedAttractor {
  const size = Math.min(Math.abs(width), Math.abs(height));
  return {
    x: x + width / 2,
    y: y + height / 2,
    radius: Math.min(MAX_ARRIVAL_RADIUS, size * 0.5),
  };
}

/**
 * Resolves an element, rect, or point into a center point and a small arrival
 * radius. Elements use their center so dust fills the target instead of
 * collapsing into a single pixel.
 */
export function resolveAttractor(
  value: AttractorLike | null | undefined,
): ResolvedAttractor | null {
  if (!value) return null;

  if (isElement(value)) {
    const rect = value.getBoundingClientRect();
    return fromRect(rect.left, rect.top, rect.width, rect.height);
  }

  if (Array.isArray(value)) {
    const tuple = value as number[];
    if (tuple.length >= 4) {
      return fromRect(tuple[0] ?? 0, tuple[1] ?? 0, tuple[2] ?? 0, tuple[3] ?? 0);
    }
    return { x: tuple[0] ?? 0, y: tuple[1] ?? 0, radius: 0 };
  }

  if ("left" in value) {
    return fromRect(value.left, value.top, value.width, value.height);
  }

  if ("width" in value && "height" in value) {
    return fromRect(value.x, value.y, value.width, value.height);
  }

  return { x: value.x, y: value.y, radius: 0 };
}
