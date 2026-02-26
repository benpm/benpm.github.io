#version 300 es
// 50 000 points in a uniform grid; a ripple from an animated centre
// modulates point size and palette colour.

in float a_id;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec3 v_color;

void main() {
  const float N = 50000.0;
  float aspect = u_res.x / u_res.y;

  float cols = floor(sqrt(N * aspect));
  float rows = ceil(N / cols);

  float col = mod(a_id, cols);
  float row = floor(a_id / cols);

  vec2 uv  = vec2(col / (cols - 1.0), row / (rows - 1.0));
  vec2 pos = uv * 2.0 - 1.0;
  pos.y    = -pos.y;

  vec2 origin = vec2(cos(u_time * 0.28) * 0.55, sin(u_time * 0.21) * 0.45);
  float dist  = length(uv - (origin * 0.5 + 0.5));
  float wave  = sin(dist * 28.0 - u_time * 2.2) * 0.5 + 0.5;

  vec2 origin2 = vec2(cos(u_time * 0.20) * 0.515, sin(u_time * 0.22) * 0.45);
  float dist2  = length(uv - (origin2 * 0.5 + 0.5));
  float wave2  = sin(dist2 * 28.0 - u_time * 2.2) * 0.5 + 0.5;

  pos += (origin2 - pos) * wave2 * 0.1;

  gl_Position  = vec4(pos, 0.0, 1.0);
  gl_PointSize = 3.0 + wave * 3.0;
  v_color      = u_palette[clamp(int(wave * 5.0), 0, 4)];
}
