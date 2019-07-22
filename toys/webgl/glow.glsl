precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform vec4 uMouse;
uniform float uParam1;

vec4 sample(vec2 pSize, float px, float py) {
    return texture2D(uSampler, vTextureCoord + vec2(pSize.x * px, pSize.y * py));
}

void main(void) {
    vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
    float pMouseDist = distance(vTextureCoord * vec2(uWidth, uHeight), uMouse.xy * vec2(uWidth, uHeight));
    vec4 here = sample(pSize, 0.0, 0.0);
    float n = 8.0;
    float nx = vTextureCoord.y / uParam1;
    float ny = vTextureCoord.y / uParam1;
    gl_FragColor = (
          sample(pSize, nx * 0.0    , ny * n)
        + sample(pSize, nx * n      , ny * 0.0)
        + sample(pSize, nx * 0.0    , ny * -n)
        + sample(pSize, nx * -n     , ny * 0.0)
        + sample(pSize, nx * n      , ny * n)
        + sample(pSize, nx * n      , ny * -n)
        + sample(pSize, nx * -n     , ny * n)
        + sample(pSize, nx * -n     , ny * -n)) / 8.0;
    gl_FragColor.w = 1.0;
    if (uMouse.z == 0.0 && pMouseDist < uMouse.w) {
        gl_FragColor = vec4(distance(vTextureCoord, uMouse.xy) * uWidth);
    }
    if (uMouse.z == 2.0 && pMouseDist < uMouse.w) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}