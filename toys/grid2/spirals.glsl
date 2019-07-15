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
   //pSize.x += mod(uTime * 0.01, uWidth);
   //pSize.y += mod(uTime * 0.01, uHeight);
   //vec4 right = texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y));
   //vec4 left = texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y));
   //vec4 down = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pSize.y));
   //vec4 up = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pSize.y));
   vec4 here = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
   vec4 there = texture2D(uSampler, vec2(vTextureCoord.x + pSize.x * cos(uTime * 3.0) * uTime, vTextureCoord.y + pSize.y * sin(uTime * 3.0) * uTime));
   float threshold = 0.3;
   float mixing = 0.2;
   if (lum(there.rgb) > lum(here.rgb) + threshold)
      here = mix(here, there, mixing);
   
   gl_FragColor = here;
}