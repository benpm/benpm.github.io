precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform vec4 uMouse;

const float power = 8.0;

void main(void) {
    vec2 pSize = vec2(1.0 / uWidth, 1.0 / uHeight);
    vec4 here = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
    vec4 A = texture2D(uSampler, vec2(
        vTextureCoord.x + pSize.x * (cos(here.g * power - (power / 2.0))), 
        vTextureCoord.y + pSize.y * (sin(here.r * power - (power / 2.0)))));
    here.g = mix(here.g, here.b, 0.01);
    here.r = mix(here.r, here.g, 0.01);
    here.b = mix(here.b, here.r, 0.01);
    gl_FragColor = A;
}