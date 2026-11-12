import { useCallback, useEffect, useRef } from "react";
import type { HTMLAttributes, RefObject } from "react";
import { playEffect } from "./core/run";
import type { PlayEffectOptions } from "./core/run";
import type { EffectHandle, EffectName } from "./core/types";

export function useThanosFx<T extends HTMLElement>(
  ref: RefObject<T | null>,
  effect: EffectName,
  options: PlayEffectOptions = {},
): { play: () => EffectHandle | null; cancel: () => void } {
  const handle = useRef<EffectHandle | null>(null);

  const play = useCallback(() => {
    if (!ref.current) return null;
    handle.current = playEffect(ref.current, effect, options);
    return handle.current;
  }, [effect, options, ref]);

  const cancel = useCallback(() => {
    handle.current?.cancel();
    handle.current = null;
  }, []);

  return { play, cancel };
}

export interface ThanosFxProps extends HTMLAttributes<HTMLDivElement> {
  effect: EffectName;
  options?: PlayEffectOptions;
  /** Play automatically after the first paint. */
  autoPlay?: boolean;
}

export function ThanosFx({ effect, options, autoPlay = false, children, ...rest }: ThanosFxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { play } = useThanosFx(ref, effect, options);

  useEffect(() => {
    if (!autoPlay) return;
    const frame = requestAnimationFrame(() => play());
    return () => cancelAnimationFrame(frame);
  }, [autoPlay, play]);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
