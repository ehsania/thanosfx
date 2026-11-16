export type EffectName = "burn" | "assemble";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export type RectLike =
  | Rect
  | DOMRect
  | Element
  | [number, number, number, number]
  | { left: number; top: number; width: number; height: number };

/** A screen point, rect, rect-like object, or element used as a dust attractor. */
export type AttractorLike = RectLike | Point | [number, number];

export interface EffectOptions {
  /** Total animation time in milliseconds. */
  duration?: number;
  /** Remove the element after the effect completes. Defaults per effect. */
  removeTarget?: boolean;
  /** Device pixel ratio override. */
  dpr?: number;
  /** "auto" honors prefers-reduced-motion; "allow" forces the full effect. */
  reducedMotion?: "auto" | "allow" | "reduce";

  // Burn / assemble
  burnMs?: number;
  density?: number;
  gravity?: number;
  bounce?: number;
  spread?: number;
  life?: number;
  friction?: number;
  lift?: number;
  particleScale?: number;
  embers?: boolean;
  collision?: boolean;
  mode?: "sweep" | "instant";
  collideWith?: RectLike[];
  /** Dust is pulled toward this element, rect, or point. */
  attractTo?: AttractorLike | null;
  /** How early the pull starts in each particle's life. 0 = late, 1 = early. */
  attractStrength?: number;
  /** Sideways curl while being pulled toward the attractor. Negative reverses. */
  attractSwirl?: number;
}

export interface EffectHandle {
  /** Resolves when the effect has finished or was cancelled. */
  readonly promise: Promise<void>;
  /** Stop immediately and restore the target. */
  cancel(): void;
}

export interface EffectFrame {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  texture: WebGLTexture;
  capture: HTMLCanvasElement;
  rect: Rect;
  dpr: number;
  target: HTMLElement;
  options: ResolvedEffectOptions;
}

export interface EffectInstance {
  readonly duration: number;
  render(elapsedSeconds: number): void;
  dispose(): void;
  /** Called after cleanup. Override visibility behavior here. */
  finish?(): void;
}

export type ResolvedEffectOptions = Required<
  Pick<
    EffectOptions,
    | "duration"
    | "removeTarget"
    | "dpr"
    | "reducedMotion"
    | "burnMs"
    | "density"
    | "gravity"
    | "bounce"
    | "spread"
    | "life"
    | "friction"
    | "lift"
    | "particleScale"
    | "embers"
    | "collision"
    | "mode"
    | "collideWith"
    | "attractTo"
    | "attractStrength"
    | "attractSwirl"
  >
>;

export type EffectFactory = (frame: EffectFrame) => EffectInstance;
