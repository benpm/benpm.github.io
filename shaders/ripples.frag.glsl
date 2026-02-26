#version 300 es
// Eight fixed sources emit expanding circular ripples that overlap like rain on water.
precision mediump float;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float aspect = u_res.x / u_res.y;
  float t = u_time * 0.9;

  float val = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    vec2 src = vec2(
      fract(sin(fi * 127.1 + 311.7) * 43758.5) * aspect,
      fract(sin(fi * 269.5 + 183.3) * 43758.5)
    );
    float d = length(uv - src);
    float phase = fi * 0.731 * 6.28318;
    val += sin(d * 16.0 - t * 1.6 + phase) / (1.0 + d * 6.0);
  }

  float n = clamp(val * 0.38 + 0.5, 0.0, 1.0);
  fragColor = vec4(u_palette[clamp(int(n * 5.0), 0, 4)], 1.0);
}
