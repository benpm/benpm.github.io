precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform sampler2D uSampler;//The image data
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform vec4 uMouse;
uniform float uParam1;

float add(vec2 a)
{
	return a.x+a.y;
}

float sub(vec2 a)
{
	return a.x-a.y;
}

void main()
{
	vec2 uv = vTextureCoord.xy;
	float scale = uHeight / uWidth;
	uv=((uv-0.5)*(1.0 / uTime));
	uv.y*=scale;
	uv.y+=uMouse.y;
	uv.x-=-uMouse.x;

	/*z is complex*/
	/*z.x is real*/
	/*z.y is imaginary*/
	vec2 z = vec2(0.0, 0.0);
	vec3 c = vec3(0.0, 0.0, 0.0);
	float v;
	
	for(int i = 0; i < 50; i++)
	{

		if(add(z * z) >= 4.0) break; /*add(z * z) = z.x*z.x + z.y*z.y*/
		z = vec2(sub(z * z), 2.0 * z.y * z.x) + uv; /*sub(z * z) = z^2 = z.x*z.x - z.y*z.y*/
		
		
		if(add(z * z) >= 2.0) /*add(z * z) = z.x*z.x + z.y*z.y*/
		{
			c.b = float(i) / 20.0;
			c.r = sin(float(i) / 5.0);
		}

	}
	
	
	gl_FragColor = vec4(c, 1.0);
}