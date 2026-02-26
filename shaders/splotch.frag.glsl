#version 300 es
// Shifting blobs of simplex noise, hard-quantised to the site palette.
precision mediump float;

uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_palette[5];

out vec4 fragColor;

// Ashima Arts 2D simplex noise (MIT licence)
vec3 _m3(vec3 x) {
  return x - floor(x * (1.f / 289.f)) * 289.f;
}
vec2 _m2(vec2 x) {
  return x - floor(x * (1.f / 289.f)) * 289.f;
}
vec3 _p(vec3 x) {
  return _m3(((x * 34.f) + 10.f) * x);
}
float snoise(vec2 v) {
  const vec4 C = vec4(.211324865405187f, .366025403784439f, -.577350269189626f, .024390243902439f);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1, 0) : vec2(0, 1);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = _m2(i);
  vec3 p = _p(_p(i.y + vec3(0, i1.y, 1)) + i.x + vec3(0, i1.x, 1));
  vec3 m = max(.5f - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.f);
  m = m * m;
  m = m * m;
  vec3 x = 2.f * fract(p * C.www) - 1.f;
  vec3 h = abs(x) - .5f;
  vec3 a0 = x - floor(x + .5f);
  m *= 1.79284291400159f - .85373472095314f * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.f * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * 0.05f;
  float n = snoise(uv * 1.6f + vec2(t * 0.55f, t * 0.40f)) * 0.55f;
  n += snoise(uv * 3.2f - vec2(t * 0.30f, t * 0.50f)) * 0.30f;
  n += snoise(uv * 6.5f + vec2(t * 0.20f, -t * 0.28f)) * 0.15f;
  n = clamp(n * 0.5f + 0.5f, 0.0f, 1.0f);
  fragColor = vec4(u_palette[clamp(int(n * 5.0f), 0, 4)], 1.0f);
}
