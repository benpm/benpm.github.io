precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform vec4 uMouse;
uniform float uParam1;

void main(void) {
    vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
    float pMouseDist = distance(vTextureCoord * vec2(uWidth, uHeight), uMouse.xy * vec2(uWidth, uHeight));
    vec4 here = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
    float n = here.g, p = here.r;
    if (uMouse.z == 0.0 && pMouseDist < uMouse.w) {
        n = here.r * 12.0;
        p = here.b * 12.0;
    }
    vec4 A = texture2D(uSampler, vec2(
        vTextureCoord.x + pSize.x * (n * uParam1 - (uParam1 / 2.0)), 
        vTextureCoord.y + pSize.y * (p * uParam1 - (uParam1 / 2.0))));
    vec4 B = texture2D(uSampler, vec2(
        vTextureCoord.x + pSize.x * (p * uParam1 - (uParam1 / 2.0)), 
        vTextureCoord.y + pSize.y * (here.b * uParam1 - (uParam1 / 2.0))));
    gl_FragColor = mix(here, mix(A, B, 0.5), clamp(here.b + uTime, 0.2, 0.8));
}