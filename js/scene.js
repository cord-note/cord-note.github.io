// Draws the Cord lock-screen clouds on a canvas. Port of the app's SceneRenderer.
import { CLOUDS_SHADER, MARK_SHADER, VERTEX_SHADER } from './scene-shaders.js';

const CELL = 4;
const FPS = 1;

function rgb(value) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function link(gl, fragment) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX_SHADER], [gl.FRAGMENT_SHADER, fragment]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

export function startScene(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, alpha: true });
  if (!gl) return;
  const field = link(gl, CLOUDS_SHADER);
  const marks = link(gl, MARK_SHADER);
  if (!field || !marks) return;

  const at = (program, name) => gl.getUniformLocation(program, name);
  const fieldTex = gl.createTexture();
  const glyphTex = gl.createTexture();
  const framebuffer = gl.createFramebuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  for (const program of [field, marks]) {
    const pos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  }
  for (const tex of [fieldTex, glyphTex]) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  gl.useProgram(field);
  gl.uniform1f(at(field, 'uSeed'), 42);
  gl.useProgram(marks);
  gl.uniform1i(at(marks, 'uField'), 0);
  gl.uniform1i(at(marks, 'uGlyphs'), 1);
  gl.uniform1f(at(marks, 'uGlyph'), 0);

  let cols = 1;
  let rows = 1;
  let cellPx = 1;

  function tones() {
    const css = getComputedStyle(canvas);
    gl.useProgram(marks);
    gl.uniform3fv(at(marks, 'uShade'), rgb(css.getPropertyValue('--scene-shade').trim()));
    gl.uniform3fv(at(marks, 'uMid'), rgb(css.getPropertyValue('--scene-mid').trim()));
    gl.uniform3fv(at(marks, 'uLight'), rgb(css.getPropertyValue('--scene-light').trim()));
    gl.uniform1f(at(marks, 'uInvert'), css.getPropertyValue('--scene-invert').trim() === '1' ? 1 : 0);
  }

  function resize() {
    const box = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cellPx = Math.max(1, Math.round(CELL * dpr));
    cols = Math.max(1, Math.ceil((box.width * dpr) / cellPx));
    rows = Math.max(1, Math.ceil((box.height * dpr) / cellPx));
    canvas.width = cols * cellPx;
    canvas.height = rows * cellPx;
    canvas.style.width = `${canvas.width / dpr}px`;
    canvas.style.height = `${canvas.height / dpr}px`;

    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0);

    gl.useProgram(field);
    gl.uniform2f(at(field, 'uRes'), cols, rows);
    gl.uniform1f(at(field, 'uUnit'), Math.min(rows, cols * 1.2));
    gl.useProgram(marks);
    gl.uniform2f(at(marks, 'uCells'), cols, rows);
    gl.uniform1f(at(marks, 'uCellPx'), cellPx);
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const started = performance.now();
  let visible = true;

  function draw() {
    if (gl.isContextLost()) return;
    const time = motion.matches ? 8 : 8 + (performance.now() - started) / 1000;
    gl.useProgram(field);
    gl.uniform1f(at(field, 'uTime'), time);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, cols, rows);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.useProgram(marks);
    gl.uniform1f(at(marks, 'uTime'), time);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cols * cellPx, rows * cellPx);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fieldTex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, glyphTex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  new ResizeObserver(() => { resize(); draw(); }).observe(canvas.parentElement);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);
  new MutationObserver(() => { tones(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  tones();
  resize();
  draw();
  setInterval(() => {
    if (visible && !document.hidden && !motion.matches) draw();
  }, 1000 / FPS);
}
