#version 300 es
// Six drifting Voronoi seeds produce crystalline cells with dark boundary lines.
precision mediump float;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float aspect = u_res.x / u_res.y;
  float t = u_time * 0.09;

  float closest = 1e9;
  float second  = 1e9;

  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float a  = fi * 1.0472 + t * (0.27 + fi * 0.06);
    float r  = 0.42 + 0.14 * sin(t * 0.41 + fi * 1.3);
    vec2 seed = vec2(cos(a), sin(a)) * r
              + vec2(sin(t * 0.22 + fi * 2.1), cos(t * 0.17 + fi * 1.7)) * 0.12
              + vec2(aspect * 0.5, 0.5);
    float d = length(uv - seed);
    if (d < closest) { second = closest; closest = d; }
    else if (d < second) { second = d; }
  }

  float edge = clamp((second - closest) * 14.0, 0.0, 1.0);
  fragColor = vec4(u_palette[clamp(int(edge * 5.0), 0, 4)], 1.0);
}
