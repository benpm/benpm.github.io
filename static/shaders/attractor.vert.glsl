#version 300 es
// 50 000 points advected through a Clifford strange attractor vector field.
// Each point starts at a unique position seeded by a_id, then is iterated
// through the attractor equations. Time slowly morphs the parameters,
// creating an evolving organic flow.

in float a_id;

uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_palette[5];

out vec3 v_color;

void main() {
  const float N = 50000.0;

  // Seed each point with a unique position using a hash-like scatter
  float h  = fract(sin(a_id * 127.1 + 311.7) * 43758.5453);
  float h2 = fract(sin(a_id * 269.5 + 183.3) * 28001.8384);
  float x = (h  * 2.0 - 1.0) * 2.0;
  float y = (h2 * 2.0 - 1.0) * 2.0;

  // Slowly varying Clifford attractor parameters
  float t = u_time * 0.08;
  float a = sin(t * 0.7) * 1.2 + 0.3;
  float b = cos(t * 0.5) * 1.5 - 0.2;
  float c = sin(t * 0.3 + 2.0) * 1.0 + 0.5;
  float d = cos(t * 0.4 + 1.0) * 1.3 - 0.1;

  // Iterate the attractor to settle into the strange attractor shape
  for (int i = 0; i < 18; i++) {
    float nx = sin(a * y) + c * cos(a * x);
    float ny = sin(b * x) + d * cos(b * y);
    x = nx;
    y = ny;
  }

  // Map to screen space with aspect correction
  vec2 pos = vec2(x, y) * 0.35;
  pos.x *= u_res.y / u_res.x;

  // Derive color from position within the attractor
  float band = fract(length(vec2(x, y)) * 0.8 + h * 0.3);
  int idx = clamp(int(band * 5.0), 0, 4);

  // Vary point size based on position density hint
  float sz = 2.0 + abs(sin(x * 3.0 + y * 2.0)) * 3.0;

  gl_Position  = vec4(pos, 0.0, 1.0);
  gl_PointSize = sz;
  v_color      = u_palette[idx];
}
