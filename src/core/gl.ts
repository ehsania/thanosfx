import type { EffectFrame } from "./types";

export const QUAD_VERTEX = `#version 300 es
precision highp float;
in vec2 a_corner;
uniform vec2 u_res;
uniform vec4 u_row;
out vec2 v_uv;
void main() {
  vec2 pos = u_row.xy + a_corner * u_row.zw;
  v_uv = a_corner;
  vec2 clip = vec2(pos.x / u_res.x * 2.0 - 1.0, 1.0 - pos.y / u_res.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown shader error";
    gl.deleteShader(shader);
    throw new Error(`Shader compile error:\n${log}`);
  }
  return shader;
}

export function linkProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "unknown link error";
    gl.deleteProgram(program);
    throw new Error(`Program link error:\n${log}`);
  }
  return program;
}

export function createTexture(gl: WebGL2RenderingContext, source: TexImageSource): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Could not create texture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  return texture;
}

export class QuadProgram {
  readonly program: WebGLProgram;
  private readonly gl: WebGL2RenderingContext;
  private readonly buffer: WebGLBuffer;
  private readonly corner: number;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(gl: WebGL2RenderingContext, fragmentSource: string) {
    this.gl = gl;
    this.program = linkProgram(gl, QUAD_VERTEX, fragmentSource);
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Could not create quad buffer");
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
      gl.STATIC_DRAW,
    );
    this.corner = gl.getAttribLocation(this.program, "a_corner");
    gl.useProgram(this.program);
    for (const name of ["u_res", "u_row", "u_tex"]) this.location(name);
  }

  location(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
    return this.uniforms.get(name) ?? null;
  }

  use(frame: EffectFrame): void {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.corner);
    gl.vertexAttribPointer(this.corner, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(this.location("u_res"), frame.canvas.width, frame.canvas.height);
    gl.uniform4f(
      this.location("u_row"),
      frame.rect.x * frame.dpr,
      frame.rect.y * frame.dpr,
      frame.rect.width * frame.dpr,
      frame.rect.height * frame.dpr,
    );
    gl.uniform1i(this.location("u_tex"), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frame.texture);
  }

  set1f(name: string, value: number): void {
    this.gl.uniform1f(this.location(name), value);
  }

  set2f(name: string, x: number, y: number): void {
    this.gl.uniform2f(this.location(name), x, y);
  }

  set4f(name: string, x: number, y: number, z: number, w: number): void {
    this.gl.uniform4f(this.location(name), x, y, z, w);
  }

  draw(): void {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
    this.gl.deleteBuffer(this.buffer);
  }
}

export const COMMON_FRAGMENT_PREAMBLE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_progress;
uniform vec2 u_res;
uniform vec4 u_row;
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec4 sampleSource(vec2 uv) {
  return texture(u_tex, vec2(clamp(uv.x, 0.0, 1.0), 1.0 - clamp(uv.y, 0.0, 1.0)));
}`;
