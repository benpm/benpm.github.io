#version 300 es
// Three plane waves at slowly rotating angles produce shifting moiré interference.
precision mediump float;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;
  float t = u_time * 0.18;

  vec2 d0 = vec2(cos(t * 0.31),        sin(t * 0.31));
  vec2 d1 = vec2(cos(t * 0.19 + 1.57), sin(t * 0.19 + 1.57));
  vec2 d2 = vec2(cos(t * 0.23 + 0.87), sin(t * 0.23 + 0.87));

  float w  = sin(dot(uv, d0) * 9.0)             * 0.50;
        w += sin(dot(uv, d1) * 7.0 + t * 1.10)  * 0.32;
        w += sin(dot(uv, d2) * 11.0 - t * 0.70) * 0.18;

  float n = clamp(w * 0.5 + 0.5, 0.0, 1.0);
  fragColor = vec4(u_palette[clamp(int(n * 5.0), 0, 4)], 1.0);
}
