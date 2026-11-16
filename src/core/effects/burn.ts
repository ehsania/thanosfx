import { resolveAttractor } from "../attractor";
import { linkProgram, QuadProgram } from "../gl";
import { clamp01 } from "../math";
import type { EffectFrame, EffectInstance, Rect, RectLike } from "../types";

const BURN_FRAGMENT = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_sweep;
uniform float u_gray;
uniform float u_black;
uniform float u_mode;
uniform float u_embers;
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float frontFn(vec2 uv) {
  float n = hash21(uv * 7.0);
  return clamp(uv.x * 0.78 + uv.y * 0.22 + (n - 0.5) * 0.10, 0.0, 1.0);
}
void main() {
  vec4 tex = texture(u_tex, vec2(v_uv.x, 1.0 - v_uv.y));
  if (tex.a < 0.01) discard;
  float startT = (u_mode > 0.5) ? frontFn(v_uv) * u_sweep : 0.0;
  float burn = u_gray + u_black;
  float blackDone = startT + burn;
  float vanishBand = 0.10 * max(burn, 0.0001);
  float ft = clamp((u_time - startT) / max(burn, 0.0001), 0.0, 1.0);
  float e = ft * ft;
  vec3 carbon = vec3(0.03);
  vec3 col = mix(tex.rgb, carbon, e);
  float vanish = smoothstep(blackDone, blackDone + vanishBand, u_time);
  float alpha = tex.a * (1.0 - vanish);
  if (alpha <= 0.003) discard;
  float ember = exp(-pow((u_time - blackDone) / (0.09 * max(u_sweep, burn)), 2.0));
  col += vec3(1.0, 0.40, 0.11) * ember * 0.85 * u_embers * step(0.6, e);
  o = vec4(col, alpha);
}`;

const PARTICLE_VERTEX = `#version 300 es
precision highp float;
in vec2 a_uv;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform vec4 u_row;
uniform float u_time;
uniform float u_sweep;
uniform float u_gray;
uniform float u_black;
uniform float u_mode;
uniform float u_g;
uniform float u_radius;
uniform float u_rectCount;
uniform float u_collOn;
uniform float u_rest;
uniform float u_friction;
uniform float u_life;
uniform float u_dpr;
uniform float u_cell;
uniform float u_pscale;
uniform float u_spread;
uniform float u_lift;
uniform float u_attractOn;
uniform vec2 u_attract;
uniform float u_attractRadius;
uniform float u_attractStrength;
uniform float u_attractSwirl;
const int MAX_RECTS = 6;
uniform vec4 u_rects[MAX_RECTS];
out float v_alpha;
out vec3 v_col;
out float v_glow;
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float frontFn(vec2 uv) {
  float n = hash21(uv * 7.0);
  return clamp(uv.x * 0.78 + uv.y * 0.22 + (n - 0.5) * 0.10, 0.0, 1.0);
}
float crossTime(vec2 p, vec2 v, float g, float plane, float tr) {
  float a = 0.5 * g, b = v.y, c = p.y - plane;
  float disc = b * b - 4.0 * a * c;
  if (disc < 0.0) return 1e9;
  float sq = sqrt(disc);
  float r1 = (-b - sq) / (2.0 * a);
  float r2 = (-b + sq) / (2.0 * a);
  float tt = 1e9;
  if (r1 > 1e-4) tt = r1;
  if (r2 > 1e-4 && r2 < tt) tt = r2;
  return (tt <= tr) ? tt : 1e9;
}
float hitRect(vec2 p, vec2 v, float g, float tr, vec4 rect, out vec2 normal) {
  float left = rect.x, top = rect.y, right = rect.x + rect.z, r = u_radius;
  float t0 = crossTime(p, v, g, top, tr);
  if (t0 >= 1e9) return 1e9;
  float x0 = p.x + v.x * t0;
  if (x0 < left || x0 > right) return 1e9;
  bool leftC = x0 < left + r, rightC = x0 > right - r;
  if (!leftC && !rightC) { normal = vec2(0.0, -1.0); return t0; }
  float cx = leftC ? left + r : right - r, cy = top + r;
  float dx = x0 - cx;
  float inside = r * r - dx * dx;
  if (inside <= 0.0) return 1e9;
  float sY = cy - sqrt(inside);
  float t1 = crossTime(p, v, g, sY, tr);
  if (t1 >= 1e9) return 1e9;
  float x1 = p.x + v.x * t1;
  normal = normalize(vec2(x1, sY) - vec2(cx, cy));
  return t1;
}
vec2 simulate(vec2 p0, vec2 v0, float t) {
  vec2 pos = p0, vel = v0;
  float tr = t, g = u_g;
  for (int i = 0; i < 4; i++) {
    float bestT = 1e9;
    vec2 bestN = vec2(0.0, -1.0);
    if (u_collOn > 0.5) {
      for (int k = 0; k < MAX_RECTS; k++) {
        if (k >= int(u_rectCount)) break;
        vec2 n;
        float th = hitRect(pos, vel, g, tr, u_rects[k], n);
        if (th < bestT) { bestT = th; bestN = n; }
      }
    }
    if (bestT > tr) {
      pos.x += vel.x * tr;
      pos.y += vel.y * tr + 0.5 * g * tr * tr;
      break;
    }
    pos.x += vel.x * bestT;
    pos.y += vel.y * bestT + 0.5 * g * bestT * bestT;
    vel.y += g * bestT;
    vec2 vNorm = dot(vel, bestN) * bestN;
    vec2 vTan = vel - vNorm;
    vel = vTan * u_friction - vNorm * u_rest;
    tr -= bestT;
  }
  return pos;
}
void main() {
  vec4 tx = texture(u_tex, vec2(a_uv.x, 1.0 - a_uv.y));
  float startT = (u_mode > 0.5) ? frontFn(a_uv) * u_sweep : 0.0;
  float td = startT + u_gray + u_black;
  float lt = u_time - td;
  if (tx.a < 0.4 || lt < 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    v_alpha = 0.0;
    return;
  }
  float r1 = hash21(a_uv * vec2(12.9, 78.2));
  float r2 = hash21(a_uv * vec2(39.3, 11.1));
  float r3 = hash21(a_uv * vec2(63.7, 21.4));
  float r4 = hash21(a_uv * vec2(91.2, 47.6));
  vec2 p0 = vec2(u_row.x + a_uv.x * u_row.z, u_row.y + a_uv.y * u_row.w);
  float vx = (a_uv.x - 0.5) * u_spread + (r1 - 0.5) * u_spread * 1.5;
  float vy = -u_lift * (0.35 + 0.75 * r2);
  vec2 pos = simulate(p0, vec2(vx, vy), lt);
  float life = u_life * (0.55 + 0.6 * r3);
  if (u_attractOn > 0.5) {
    // The magnet completes before the particle dies, so the dust still gathers
    // in the target. The shared fade below keeps the sprites as fine and airy
    // as the collision/none modes instead of holding them at full size.
    float absorbStart = life * 0.58;
    float pullStart = min(
      mix(0.72, 0.04, clamp(u_attractStrength, 0.0, 1.0)) * life,
      absorbStart * 0.82
    );
    float magnet = smoothstep(pullStart, absorbStart, lt);
    vec2 rel = u_attract - pos;
    float dist = max(length(rel), 0.0001);
    vec2 dir = rel / dist;
    vec2 perp = vec2(-dir.y, dir.x);
    float arcT = clamp(magnet / 0.7, 0.0, 1.0);
    float arc = sin(arcT * 3.14159265) * min(dist, 140.0) * u_attractSwirl;
    float jitter = u_attractRadius * magnet * (0.15 + 0.85 * r4);
    vec2 finalOffset = vec2(cos(r1 * 6.2831853), sin(r1 * 6.2831853)) * jitter;
    float converge = 1.0 - pow(1.0 - magnet, 2.0);
    pos = mix(pos, u_attract, converge) + perp * arc + finalOffset;
  }
  float fade = clamp(1.0 - lt / life, 0.0, 1.0);
  fade *= smoothstep(0.0, 0.12 * life, lt);
  fade = fade * fade;
  vec2 clip = vec2(pos.x / u_res.x * 2.0 - 1.0, 1.0 - pos.y / u_res.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = max(1.0, u_cell * u_dpr * u_pscale * (0.5 + 0.5 * fade));
  float emberMask = step(0.84, r4);
  float glow = emberMask * clamp(1.0 - lt / 0.22, 0.0, 1.0);
  v_col = mix(vec3(0.56), vec3(1.0, 0.45, 0.12), glow);
  v_glow = glow;
  v_alpha = fade * tx.a;
}`;

const PARTICLE_FRAGMENT = `#version 300 es
precision highp float;
in float v_alpha;
in vec3 v_col;
in float v_glow;
out vec4 o;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  float a = v_alpha * (1.0 - smoothstep(0.40, 0.5, r));
  if (a <= 0.003) discard;
  o = vec4(v_col + v_glow * 0.4, a);
}`;

function rectTuple(item: RectLike): [number, number, number, number] {
  if (Array.isArray(item)) return [item[0], item[1], item[2], item[3]];
  if (typeof Element !== "undefined" && item instanceof Element) {
    const rect = item.getBoundingClientRect();
    return [rect.left, rect.top, rect.width, rect.height];
  }
  if ("left" in item) return [item.left, item.top, item.width, item.height];
  const rect = item as Rect;
  return [rect.x, rect.y, rect.width, rect.height];
}

function resolveRects(frame: EffectFrame): Float32Array {
  const rects = frame.options.collideWith as RectLike[];
  const out = new Float32Array(24);
  rects.slice(0, 6).forEach((item, index) => {
    const [x, y, width, height] = rectTuple(item);
    out[index * 4 + 0] = x * frame.dpr;
    out[index * 4 + 1] = y * frame.dpr;
    out[index * 4 + 2] = width * frame.dpr;
    out[index * 4 + 3] = height * frame.dpr;
  });
  return out;
}

function makeUVBuffer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  density: number,
): { buffer: WebGLBuffer; count: number } {
  let cols = Math.max(8, Math.round(width * density));
  let rows = Math.max(4, Math.round(height * density));
  while (cols * rows > 140000) {
    cols = Math.round(cols * 0.92);
    rows = Math.round(rows * 0.92);
  }
  const data = new Float32Array(2 * cols * rows);
  let offset = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      data[offset++] = (x + 0.5) / cols;
      data[offset++] = (y + 0.5) / rows;
    }
  }
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Could not create particle buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return { buffer, count: cols * rows };
}

export function createBurnEffect(frame: EffectFrame, reverse = false): EffectInstance {
  const { gl, options } = frame;
  const quad = new QuadProgram(gl, BURN_FRAGMENT);
  const particleProgram = linkProgram(gl, PARTICLE_VERTEX, PARTICLE_FRAGMENT);
  const particleUv = gl.getAttribLocation(particleProgram, "a_uv");
  const particleRects = resolveRects(frame);
  const attractor = resolveAttractor(options.attractTo);
  const attractStrength = clamp01(options.attractStrength);
  const uvBuffer = makeUVBuffer(
    gl,
    frame.capture.width / frame.dpr,
    frame.capture.height / frame.dpr,
    options.density,
  );

  const grayS = (options.burnMs / 1000) * 0.55;
  const blackS = (options.burnMs / 1000) * 0.45;
  const sweepLead = options.mode === "sweep" ? 1.25 * (options.burnMs / 1000) : 0;
  const baseTotal = sweepLead + grayS + blackS + 1.2 * options.life + 0.05;
  const total = Math.max(0.05, options.duration / 1000);
  const timeScale = total / baseTotal;

  function setParticleUniforms(time: number): void {
    gl.useProgram(particleProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer.buffer);
    gl.enableVertexAttribArray(particleUv);
    gl.vertexAttribPointer(particleUv, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(
      gl.getUniformLocation(particleProgram, "u_res"),
      frame.canvas.width,
      frame.canvas.height,
    );
    gl.uniform4f(
      gl.getUniformLocation(particleProgram, "u_row"),
      frame.rect.x * frame.dpr,
      frame.rect.y * frame.dpr,
      frame.rect.width * frame.dpr,
      frame.rect.height * frame.dpr,
    );
    gl.uniform1i(gl.getUniformLocation(particleProgram, "u_tex"), 0);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_time"), time);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_sweep"), sweepLead);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_gray"), grayS);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_black"), blackS);
    gl.uniform1f(
      gl.getUniformLocation(particleProgram, "u_mode"),
      options.mode === "sweep" ? 1 : 0,
    );
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_g"), options.gravity);
    gl.uniform4fv(gl.getUniformLocation(particleProgram, "u_rects[0]"), particleRects);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_radius"), 8);
    gl.uniform1f(
      gl.getUniformLocation(particleProgram, "u_rectCount"),
      Math.min(options.collideWith.length, 6),
    );
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_collOn"), options.collision ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_rest"), options.bounce);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_friction"), options.friction);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_life"), options.life);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_dpr"), frame.dpr);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_cell"), 1 / options.density);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_pscale"), options.particleScale);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_spread"), options.spread);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_lift"), options.lift);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_attractOn"), attractor ? 1 : 0);
    gl.uniform2f(
      gl.getUniformLocation(particleProgram, "u_attract"),
      (attractor?.x ?? 0) * frame.dpr,
      (attractor?.y ?? 0) * frame.dpr,
    );
    gl.uniform1f(
      gl.getUniformLocation(particleProgram, "u_attractRadius"),
      (attractor?.radius ?? 0) * frame.dpr,
    );
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_attractStrength"), attractStrength);
    gl.uniform1f(gl.getUniformLocation(particleProgram, "u_attractSwirl"), options.attractSwirl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frame.texture);
  }

  return {
    duration: total,
    render(elapsed: number) {
      const raw = reverse ? Math.max(0, total - elapsed) : elapsed;
      const time = raw * timeScale;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      quad.use(frame);
      quad.set1f("u_time", time);
      quad.set1f("u_sweep", sweepLead);
      quad.set1f("u_gray", grayS);
      quad.set1f("u_black", blackS);
      quad.set1f("u_mode", options.mode === "sweep" ? 1 : 0);
      quad.set1f("u_embers", options.embers ? 1 : 0);
      quad.draw();

      setParticleUniforms(time);
      gl.drawArrays(gl.POINTS, 0, uvBuffer.count);
    },
    dispose() {
      quad.dispose();
      gl.deleteProgram(particleProgram);
      gl.deleteBuffer(uvBuffer.buffer);
    },
  };
}
