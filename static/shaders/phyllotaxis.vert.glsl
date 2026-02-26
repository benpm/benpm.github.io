#version 300 es
// 50 000 points in a golden-angle sunflower spiral, slowly rotating.
// Point size and palette colour vary with radial distance.

in float a_id;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec3 v_color;

void main() {
  const float N      = 50000.0;
  const float GOLDEN = 2.39996323;

  float r     = sqrt((a_id + 0.5) / N) * 2.0;
  float theta = a_id * GOLDEN + u_time * 0.04;

  vec2 pos = vec2(cos(theta), sin(theta)) * r;
  pos.x *= u_res.y / u_res.x;

  pos += vec2(cos(u_time * 0.21) * 10.55, sin(u_time * 0.28) * 0.45) * (1.0 - r) * 0.1;

  gl_Position  = vec4(pos, 0.0, 1.0);
  gl_PointSize = abs((1.0 - r) * 3.0) * 4.0;
  v_color      = u_palette[clamp(int(mod(r * 10.0, 5.0)), 0, 4)];
}
