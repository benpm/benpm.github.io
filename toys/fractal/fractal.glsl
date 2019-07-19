precision mediump float;

varying vec2 vTextureCoord;//The coordinates of the current pixel
uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform float uParam1;
uniform float uParam2;
uniform float uIterations;
uniform vec4 uView;

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
	uv=((uv-0.5)*(1.0 / uView.z));
	uv.y*=scale;
	uv.y+=uView.y;
	uv.x-=0.5 - uView.x;

	/*z is complex*/
	/*z.x is real*/
	/*z.y is imaginary*/
	vec2 z = vec2(0.0, 0.0);
	vec3 c = vec3(0.0, 0.0, 0.0);
	float v;
	
	for(float i = 0.0; i < 75.0; i++)
	{
		if(add(pow(z, vec2(uParam1))) >= uParam2) break;
		z = vec2(sub(pow(z, vec2(uParam1))), 2.0 * z.y * z.x) + uv;

		
		
		if (add(pow(z, vec2(uParam1))) >= 2.0)
		{
			float sn = i - log2(log2(dot(z,z))) + 4.0;
			c.b = sn / 20.0;
			c.r = sin(sn / 5.0);
			c.g = sin(sn / 8.0);
		}

	}
	
	
	gl_FragColor = vec4(c, 1.0);
}