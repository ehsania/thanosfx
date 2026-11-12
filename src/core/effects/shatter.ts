import { COMMON_FRAGMENT_PREAMBLE, QuadProgram } from "../gl";
import type { EffectFrame, EffectInstance } from "../types";

const FRAGMENT = `${COMMON_FRAGMENT_PREAMBLE}
uniform float u_grid;
uniform float u_spread;
uniform float u_gravity;
uniform float u_spin;
void main() {
  vec2 cell = floor(v_uv * u_grid);
  vec2 local = fract(v_uv * u_grid);
  float r = hash21(cell + 3.1);
  vec2 center = (cell + 0.5) / u_grid;
  vec2 direction = normalize(center - vec2(0.5) + vec2(0.0001));
  float p = u_progress;
  vec2 offset = direction * u_spread * p * (0.5 + 0.7 * r) * 0.01;
  offset.y += u_gravity * p * p * 0.0004;

  float angle = (r - 0.5) * u_spin * p * 3.2;
  vec2 c = local - 0.5;
  float cs = cos(angle), sn = sin(angle);
  vec2 rotated = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs) + 0.5;
  vec2 uv = (cell + rotated) / u_grid + offset;

  vec4 tex = sampleSource(uv);
  float edge = smoothstep(0.0, 0.035, local.x) * smoothstep(1.0, 0.965, local.x) *
               smoothstep(0.0, 0.035, local.y) * smoothstep(1.0, 0.965, local.y);
  float alpha = tex.a * edge * (1.0 - smoothstep(0.6, 1.0, p));
  o = vec4(tex.rgb, alpha);
}`;

export function createShatterEffect(frame: EffectFrame): EffectInstance {
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
      quad.set1f("u_grid", frame.options.grid);
      quad.set1f("u_spread", frame.options.spread);
      quad.set1f("u_gravity", frame.options.gravity);
      quad.set1f("u_spin", frame.options.spin);
      quad.draw();
    },
    dispose() {
      quad.dispose();
    },
  };
}
