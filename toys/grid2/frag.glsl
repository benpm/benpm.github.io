precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform int uRules[16];

float lum(vec3 rgb) {
   // Algorithm from Chapter 10 of Graphics Shaders.
   const vec3 W = vec3(0.2125, 0.7154, 0.0721);
   return dot(rgb, W);
}

void main(void) {
   vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
   int cell00 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y - pSize.y )).r * 10.0, 0.0, 1.0));
   int cell01 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y           )).r * 10.0, 0.0, 1.0));
   int cell02 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y + pSize.y )).r * 10.0, 0.0, 1.0));
   int cell10 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pSize.y           )).r * 10.0, 0.0, 1.0));
   int cell11 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y                     )).r * 10.0, 0.0, 1.0));
   int cell12 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pSize.y           )).r * 10.0, 0.0, 1.0));
   int cell20 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y - pSize.y )).r * 10.0, 0.0, 1.0));
   int cell21 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y           )).r * 10.0, 0.0, 1.0));
   int cell22 = int(clamp(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y + pSize.y )).r * 10.0, 0.0, 1.0));
   int n = cell00 + cell01 + cell02 + cell10 + cell12 + cell20 + cell21 + cell22;
   if (cell11 == 0) {
      cell11 = n == 2 ? 1 : 0;
   } else {
      cell11 = n >= 3 && n <= 5 ? 1 : 0;
   }
   gl_FragColor = vec4(vec3(float(cell11)), 1.0);
}