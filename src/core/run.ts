import { captureElement } from "./capture";
import { effectFactories } from "./effects";
import { createTexture } from "./gl";
import { prefersReducedMotion } from "./math";
import { resolveEffectOptions } from "./options";
import type { EffectHandle, EffectName, EffectOptions, Rect, RectLike } from "./types";

function toRect(input: RectLike): Rect | null {
  if (typeof Element !== "undefined" && input instanceof Element) {
    const rect = input.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  }
  if (Array.isArray(input)) {
    return { x: input[0] ?? 0, y: input[1] ?? 0, width: input[2] ?? 0, height: input[3] ?? 0 };
  }
  if ("left" in input) {
    return { x: input.left, y: input.top, width: input.width, height: input.height };
  }
  if ("x" in input) {
    return { x: input.x, y: input.y, width: input.width, height: input.height };
  }
  return null;
}

interface Overlay {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  dispose: () => void;
}

function createOverlay(dpr: number): Overlay {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70;display:block;";
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: false,
    antialias: true,
    alpha: true,
  });
  if (!gl) {
    canvas.remove();
    throw new Error("ThanosFx requires WebGL2");
  }
  const resize = () => {
    canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener("resize", resize);
  return {
    canvas,
    gl,
    dispose() {
      window.removeEventListener("resize", resize);
      canvas.remove();
    },
  };
}

function fadeOut(target: HTMLElement, remove: boolean, cancelled: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const previous = target.style.transition;
    const previousOpacity = target.style.opacity;
    target.style.transition = "opacity 160ms ease";
    target.style.opacity = "0";
    window.setTimeout(() => {
      if (cancelled()) {
        target.style.transition = previous;
        target.style.opacity = previousOpacity;
        resolve();
        return;
      }
      if (remove && target.parentNode) target.parentNode.removeChild(target);
      else target.style.opacity = previousOpacity;
      target.style.transition = previous;
      resolve();
    }, 180);
  });
}

export function playEffect(
  target: HTMLElement,
  effect: EffectName,
  options: EffectOptions = {},
): EffectHandle {
  if (!(target instanceof HTMLElement)) {
    throw new TypeError("playEffect(target, effect): target must be an HTMLElement");
  }

  const opts = resolveEffectOptions(effect, options);
  const dpr = Math.max(1, opts.dpr || Math.min(window.devicePixelRatio || 1, 2));
  const collisionRects = opts.collideWith.map(toRect).filter((rect): rect is Rect => rect !== null);

  let cancelled = false;
  let rafId = 0;
  let overlay: Overlay | null = null;
  let texture: WebGLTexture | null = null;
  let instance: ReturnType<(typeof effectFactories)[EffectName]> | null = null;
  let originalVisibility = target.style.visibility;
  let settled = false;

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (instance) {
      try {
        instance.dispose();
      } catch {
        // Ignore teardown failures.
      }
      instance = null;
    }
    if (overlay) {
      if (texture) overlay.gl.deleteTexture(texture);
      texture = null;
      overlay.dispose();
      overlay = null;
    }
    target.style.visibility = originalVisibility;
  };

  const finish = (remove: boolean) => {
    if (settled) return;
    settled = true;
    cleanup();
    if (remove && target.parentNode) target.parentNode.removeChild(target);
  };

  const promise = (async () => {
    if (
      opts.reducedMotion !== "allow" &&
      opts.reducedMotion !== "reduce" &&
      prefersReducedMotion()
    ) {
      await fadeOut(target, opts.removeTarget, () => cancelled);
      if (!cancelled) {
        target.style.visibility = originalVisibility;
        if (!opts.removeTarget) target.style.opacity = "1";
      }
      return;
    }

    const captured = await captureElement(target, dpr);
    if (cancelled) {
      target.style.visibility = originalVisibility;
      return;
    }

    overlay = createOverlay(dpr);
    texture = createTexture(overlay.gl, captured.canvas);
    originalVisibility = target.style.visibility;
    target.style.visibility = "hidden";

    const frame = {
      gl: overlay.gl,
      canvas: overlay.canvas,
      texture,
      capture: captured.canvas,
      rect: captured.rect,
      dpr,
      target,
      options: { ...opts, collideWith: collisionRects },
    };

    try {
      instance = effectFactories[effect](frame);
      const effectInstance = instance;
      const duration = Math.max(0.05, effectInstance.duration);
      const start = performance.now();

      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const elapsed = (now - start) / 1000;
          if (elapsed >= duration) {
            resolve();
            return;
          }
          try {
            effectInstance.render(elapsed);
          } catch (error) {
            console.error("ThanosFx effect failed:", error);
            resolve();
            return;
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      });
    } catch (error) {
      cleanup();
      throw error;
    }

    if (cancelled) {
      target.style.visibility = originalVisibility;
      return;
    }
    finish(opts.removeTarget);
  })();

  return {
    promise: promise.finally(() => {
      if (cancelled) cleanup();
    }),
    cancel() {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanup();
    },
  };
}
