import { COMMON_FRAGMENT_PREAMBLE, QuadProgram } from "../gl";
import type { EffectFrame, EffectInstance } from "../types";

const FRAGMENT = `${COMMON_FRAGMENT_PREAMBLE}
uniform float u_pixels;
uniform float u_dissolve;
void main() {
  float aspect = u_row.w / max(1.0, u_row.z);
  vec2 grid = vec2(u_pixels, max(1.0, floor(u_pixels * aspect)));
  vec2 uv = (floor(v_uv * grid) + 0.5) / grid;
  vec4 tex = sampleSource(uv);

  float p = u_progress;
  float n = hash21(floor(v_uv * grid) + 7.7);
  float threshold = p * 1.15;
  float alpha = tex.a * (1.0 - smoothstep(threshold - 0.12, threshold, n * u_dissolve + p * 0.18));
  o = vec4(tex.rgb * (1.0 - 0.15 * p), alpha);
}`;

export function createPixelateEffect(frame: EffectFrame): EffectInstance {
  const quad = new QuadProgram(frame.gl, FRAGMENT);
  return {
    duration: frame.options.duration / 1000,
    render(elapsed: number) {
      const gl = frame.gl;
      const progress = Math.min(1, elapsed / (frame.options.duration / 1000));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      quad.use(frame);
      quad.set1f("u_time", elapsed);
      quad.set1f("u_progress", progress);
      quad.set1f("u_pixels", frame.options.pixels);
      quad.set1f("u_dissolve", frame.options.dissolve);
      quad.draw();
    },
    dispose() {
      quad.dispose();
    },
  };
}
