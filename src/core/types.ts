export type EffectName = "burn" | "assemble" | "ripple" | "shred" | "shatter" | "pixelate";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RectLike =
  | Rect
  | DOMRect
  | Element
  | [number, number, number, number]
  | { left: number; top: number; width: number; height: number };

export interface EffectOptions {
  /** Total animation time in milliseconds. */
  duration?: number;
  /** Remove the element after the effect completes. Defaults per effect. */
  removeTarget?: boolean;
  /** Device pixel ratio override. */
  dpr?: number;
  /** "auto" honors prefers-reduced-motion; "allow" forces the full effect. */
  reducedMotion?: "auto" | "allow" | "reduce";
  /** Normalized pointer origin inside the target, used by ripple. */
  pointer?: { x: number; y: number };

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

  // Ripple
  amplitude?: number;
  frequency?: number;
  speed?: number;
  decay?: number;

  // Shred
  strips?: number;
  twist?: number;

  // Shatter
  grid?: number;
  spin?: number;

  // Pixelate
  pixels?: number;
  dissolve?: number;

  // Shared tint (0 = source colors, 1 = accent tint)
  tint?: number;
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
  pointer: { x: number; y: number };
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
    | "pointer"
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
    | "amplitude"
    | "frequency"
    | "speed"
    | "decay"
    | "strips"
    | "twist"
    | "grid"
    | "spin"
    | "pixels"
    | "dissolve"
    | "tint"
  >
>;

export type EffectFactory = (frame: EffectFrame) => EffectInstance;
