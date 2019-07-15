precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform int uRules[16];

void main(void) {
   vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
   vec4 right = texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y));
   vec4 left = texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y));
   vec4 down = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pSize.y));
   vec4 up = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pSize.y));
   vec4 here = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
   float threshold = 0.0;
   if (right.r > here.r + threshold)
      here = right;
   else if (left.r > here.r + threshold)
      here = left;
   if (up.r > here.r + threshold)
      here = up;
   else if (down.r > here.r + threshold)
      here = down;
   
   gl_FragColor = here;
}