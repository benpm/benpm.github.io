precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform vec4 uMouse;

float pix(vec2 pSize, float px, float py) {
    return floor(texture2D(uSampler, vTextureCoord + vec2(pSize.x * px, pSize.y * py)).r * 1.5);
}

void main(void) {
    vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
    float pMouseDist = distance(vTextureCoord * vec2(uWidth, uHeight), uMouse.xy * vec2(uWidth, uHeight));
    float here = pix(pSize, 0.0, 0.0);
    float new = 0.0;
    if (vTextureCoord.y * uHeight <= 1.0) {
        new = 0.0;
    } else if ((pix(pSize, 0.0, -1.0) == 1.0 && here == 0.0)
        || vTextureCoord.y * uHeight >= uHeight - 1.0
        || (pix(pSize, 0.0, 1.0) == 1.0 && here == 1.0)) {
        new = 1.0;
    } else {
        new = 0.0;
    }
    if (uMouse.z == 0.0 && pMouseDist < uMouse.w) {
        new = 1.0;
    }
    if (uMouse.z == 2.0 && pMouseDist < uMouse.w) {
        new = 0.0;
    }
    gl_FragColor = vec4(vec3(new), 1.0);
}