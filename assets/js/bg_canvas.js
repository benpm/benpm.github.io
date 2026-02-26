(function () {
  // Low-contrast palettes — all colours within ~8 RGB units of the bg.
  const PALETTES = {
    light: [
      '#ffffff',
      '#eeeeee',
      '#f7f7f7',
      '#f1f0eb',
      '#ffffff',
    ],
    dark: [
      '#0f0f0f',
      '#000000',
      '#202020',
      '#0e0e0e',
      '#000000',
    ],
  };

  function hexToVec3(hex) {
    const num = parseInt(hex.slice(1), 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  }

  function getPaletteVectors(key) {
    return PALETTES[key].map(hexToVec3);
  }

  // Background colours used to clear between point frames
  const BG = {
    light: hexToVec3('#f7f7f7'),
    dark:  hexToVec3('#202020'),
  };

  // ── Standard shaders ──────────────────────────────────────────────

  // Used as the vertex stage for full-screen quad (frag) shaders
  const QUAD_VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  // Used as the fragment stage for point (vert) shaders.
  // Draws an anti-aliased circle; colour and size come from the vertex shader
  // via v_color (vec3) and gl_PointSize.
  const POINTS_FRAG =`#version 300 es
precision mediump float;
in  vec3 v_color;
out vec4 fragColor;
void main() {
  vec2  c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  // Sphere depth: push fragments at the center forward, edges back
  float z = sqrt(1.0 - r2);
  gl_FragDepth = gl_FragCoord.z - z * 0.001;
  // Anti-aliased edge
  float d = sqrt(r2);
  float w = fwidth(d);
  float a = 1.0 - smoothstep(1.0 - w, 1.0, d);
  fragColor = vec4(v_color, a);
}`;

  const N_POINTS = 50000;

  // ── Canvas / WebGL2 init ──────────────────────────────────────────

  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.prepend(canvas);

  const gl = canvas.getContext('webgl2');
  if (!gl) { canvas.remove(); return; }

  // ── Helpers ───────────────────────────────────────────────────────

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('bg_canvas shader error:\n' + gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function buildProgram(vsSrc, fsSrc) {
    const vs = compileShader(gl.VERTEX_SHADER,   vsSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('bg_canvas link error:\n' + gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  function getLocs(prog) {
    return {
      time:    gl.getUniformLocation(prog, 'u_time'),
      res:     gl.getUniformLocation(prog, 'u_res'),
      palette: gl.getUniformLocation(prog, 'u_palette'),
    };
  }

  // ── Render-mode setup ─────────────────────────────────────────────
  // Both functions return a draw function (t, key) => void, or null on failure.

  // Full-screen quad driven by a custom fragment shader
  function setupQuad(fragSrc) {
    const prog = buildProgram(QUAD_VERT, fragSrc);
    if (!prog) return null;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1,  -1, 1,
      -1, 1,  1,-1,   1, 1,
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const L = getLocs(prog);

    return function (t, key) {
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform1f(L.time, t);
      gl.uniform2f(L.res, canvas.width, canvas.height);
      gl.uniform3fv(L.palette, getPaletteVectors(key).flat());
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  }

  // 50 000 point sprites driven by a custom vertex shader
  function setupPoints(vertSrc) {
    const prog = buildProgram(vertSrc, POINTS_FRAG);
    if (!prog) return null;

    const ids = new Float32Array(N_POINTS);
    for (let i = 0; i < N_POINTS; i++) ids[i] = i;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    const aId = gl.getAttribLocation(prog, 'a_id');
    gl.enableVertexAttribArray(aId);
    gl.vertexAttribPointer(aId, 1, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    const L = getLocs(prog);

    return function (t, key) {
      const bg = BG[key];
      gl.clearColor(bg[0], bg[1], bg[2], 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform1f(L.time, t);
      gl.uniform2f(L.res, canvas.width, canvas.height);
      gl.uniform3fv(L.palette, getPaletteVectors(key).flat());
      gl.drawArrays(gl.POINTS, 0, N_POINTS);
    };
  }

  // ── Resize / theme ────────────────────────────────────────────────

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  let themeKey = 'light';
  new MutationObserver(function () {
    themeKey = document.body.classList.contains('theme--dark') ? 'dark' : 'light';
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ── Animation loop ────────────────────────────────────────────────

  let running = true;
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  let drawFn = null;
  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    if (drawFn) drawFn((ts - start) * 0.001, themeKey);
    if (running) requestAnimationFrame(frame);
  }

  // ── Shader switching ──────────────────────────────────────────────

  let manifest = [];
  let currentIdx = 0;
  const drawFnCache = {};

  function updateButton(idx) {
    const btn = document.getElementById('shader-toggle-button');
    if (!btn || !manifest[idx]) return;
    const img = btn.querySelector('img');
    if (img) img.src = '/svg/' + manifest[idx].icon + '.svg';
  }

  async function activateShader(idx) {
    if (drawFnCache[idx]) {
      drawFn = drawFnCache[idx];
      updateButton(idx);
      return;
    }
    const def = manifest[idx];
    const src = await fetch('/shaders/' + def.file).then(r => r.text());
    const fn = def.type === 'frag' ? setupQuad(src) : setupPoints(src);
    if (fn) {
      drawFnCache[idx] = fn;
      drawFn = fn;
    }
    updateButton(idx);
  }

  window.bgCanvas = {
    nextShader: function () {
      currentIdx = (currentIdx + 1) % manifest.length;
      localStorage.setItem('shader', currentIdx.toString());
      activateShader(currentIdx);
    },
  };

  // ── Async init ────────────────────────────────────────────────────

  async function init() {
    manifest = await fetch('/shaders/shaders.json').then(r => r.json());
    const saved = parseInt(localStorage.getItem('shader'));
    currentIdx = (!isNaN(saved) && saved >= 0 && saved < manifest.length)
      ? saved
      : Math.floor(Math.random() * manifest.length);

    themeKey = document.body.classList.contains('theme--dark') ? 'dark' : 'light';

    await activateShader(currentIdx);
    if (!drawFn) { canvas.remove(); return; }

    requestAnimationFrame(frame);
  }

  init().catch(function (e) {
    console.warn('bg_canvas: shader load failed, canvas removed.', e);
    canvas.remove();
  });
}());
