precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;

void main(void) {
   vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
   vec4 here   = texture2D(uSampler, vTextureCoord);
   vec4 up     = texture2D(uSampler, vec2(0, vTextureCoord.y - pSize.y));
   vec4 down   = texture2D(uSampler, vec2(0, vTextureCoord.y + pSize.y));
   vec4 left   = texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, 0));
   vec4 right  = texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, 0));
   gl_FragColor = (up + down + left + right) / 3.99;
}