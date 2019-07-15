precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform int uRules[16];

void main(void) {
   vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
   int n = -1;
   int val = int(clamp(texture2D(uSampler, vTextureCoord).r, 0.0, 1.0));

   for (float x = -1.0; x <= 1.0; x += 1.0) {
      for (float y = -1.0; y <= 1.0; y += 1.0) {
         n += int(clamp(texture2D(uSampler, 
            vec2(vTextureCoord.x + (pSize.x * x), vTextureCoord.y + (pSize.y * y))).r, 0.0, 1.0));
      }
   }
   /* int cell00 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y - pSize.y)), one));
      int cell01 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y)), one));
      int cell02 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x - pSize.x, vTextureCoord.y + pSize.y)), one));

      int cell10 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - pSize.y)), one));
      int cell11 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)), one));
      int cell12 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + pSize.y)), one));

      int cell20 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y - pSize.y)), one));
      int cell21 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y)), one));
      int cell22 = int(dot4(texture2D(uSampler, vec2(vTextureCoord.x + pSize.x, vTextureCoord.y + pSize.y)), one)); */

   //val = uRules[val * 8 + n];
   n = int(mod(vTextureCoord.x * 32.0, 8.0));
   /* if (val == 0) {
      val = n == 3 ? 1 : 0;
   } else {
      val = n >= 3 && n <= 4 ? 1 : 0;
   } */
   
   gl_FragColor = vec4(vec3(val), 1);
}