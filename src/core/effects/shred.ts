import { COMMON_FRAGMENT_PREAMBLE, QuadProgram } from "../gl";
import type { EffectFrame, EffectInstance } from "../types";

const FRAGMENT = `${COMMON_FRAGMENT_PREAMBLE}
uniform float u_strips;
uniform float u_spread;
uniform float u_gravity;
uniform float u_twist;
void main() {
  float strip = floor(v_uv.y * u_strips);
  float r = hash21(vec2(strip, 1.7));
  float direction = (r - 0.5) * 2.0;
  float p = u_progress;
  float offset = direction * u_spread * p * (0.45 + 0.55 * r) * 0.01;
  float drop = u_gravity * p * p * 0.00045 * (0.35 + r);
  float twist = (v_uv.y - 0.5) * u_twist * p * 0.22;
  vec2 uv = v_uv + vec2(offset + twist, drop);

  float edge = smoothstep(0.0, 0.04, fract(v_uv.y * u_strips)) *
               smoothstep(1.0, 0.96, fract(v_uv.y * u_strips));
  vec4 tex = sampleSource(uv);
  float alpha = tex.a * edge * (1.0 - smoothstep(0.55, 1.0, p));
  o = vec4(tex.rgb, alpha);
}`;

export function createShredEffect(frame: EffectFrame): EffectInstance {
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
      quad.set1f("u_strips", frame.options.strips);
      quad.set1f("u_spread", frame.options.spread);
      quad.set1f("u_gravity", frame.options.gravity);
      quad.set1f("u_twist", frame.options.twist);
      quad.draw();
    },
    dispose() {
      quad.dispose();
    },
  };
}
