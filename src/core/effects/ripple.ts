import { COMMON_FRAGMENT_PREAMBLE, QuadProgram } from "../gl";
import type { EffectFrame, EffectInstance } from "../types";

const FRAGMENT = `${COMMON_FRAGMENT_PREAMBLE}
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_speed;
uniform float u_decay;
uniform vec2 u_pointer;
void main() {
  vec2 center = u_pointer;
  float d = distance(v_uv, center);
  float wave = sin(d * u_frequency - u_time * u_speed) * exp(-d * u_decay);
  wave *= u_amplitude * (1.0 - u_progress);
  vec2 dir = normalize(v_uv - center + vec2(0.0001));
  vec2 uv = v_uv + dir * wave * 0.01;

  vec2 shift = dir * wave * 0.0015;
  float r = sampleSource(uv + shift).r;
  float g = sampleSource(uv).g;
  float b = sampleSource(uv - shift).b;
  vec4 base = sampleSource(uv);
  o = vec4(r, g, b, base.a);
}`;

export function createRippleEffect(frame: EffectFrame): EffectInstance {
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
      quad.set1f("u_amplitude", frame.options.amplitude);
      quad.set1f("u_frequency", frame.options.frequency);
      quad.set1f("u_speed", frame.options.speed);
      quad.set1f("u_decay", frame.options.decay);
      quad.set2f("u_pointer", frame.pointer.x, frame.pointer.y);
      quad.draw();
    },
    dispose() {
      quad.dispose();
    },
  };
}
