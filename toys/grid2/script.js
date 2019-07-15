'use strict';

var resources = {};
var resourcesRemaining = 0;
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
var flip = false;
var shaderProgram, uniforms, aVertexPosition, vertexBuffer, dataTex, targetTex, fbA, fbB;
const rules = new Int32Array([
    0, 0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0
]);

function animateScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Render to rendertexture
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, flip ? fbB : fbA);
        gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, flip ? targetTex : dataTex);
    
        uniforms.time.val += 0.01;
        gl.uniform1f(uniforms.time.loc, uniforms.time.val);
        gl.uniform1f(uniforms.width.loc, canvas.width);
        gl.uniform1f(uniforms.height.loc, canvas.height);
        gl.uniform1i(uniforms.sampler.loc, 0);
        gl.uniform1iv(uniforms.rules.loc, rules);
    
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        //Define viewport and clear
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targetTex);
    
        gl.enableVertexAttribArray(aVertexPosition);
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        //Define viewport and clear
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  
    flip = !flip;
    window.requestAnimationFrame(animateScene);
}

function main() {
    //Check if WebGL2 is available
    if (gl == null) {
        console.error("Unable to initialize WebGL 2 context");
        return;
    }

    //Texture
    let texData = new Uint8Array(canvas.width * canvas.height * 3);
    for (let i = 0; i < texData.length; i++) {
        texData[i] = 255;
    }

    //Texture A
    dataTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, texData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    fbB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dataTex, 0);

    //Destination texture
    targetTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, canvas.width, canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    //Framebuffer
    fbA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);

    //Shaders
    const shaderSet = [
        {type: gl.FRAGMENT_SHADER, name: "frag"},
        {type: gl.VERTEX_SHADER, name: "vertex"}
    ];
    shaderProgram = buildShaderProgram(shaderSet);
    var aspect = canvas.width / canvas.height;
    var vertexArray = new Float32Array([
        -1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, -1.0, -1.0
    ]);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    uniforms = {
        time: {loc: gl.getUniformLocation(shaderProgram, "uTime"), val: 0},
        width: {loc: gl.getUniformLocation(shaderProgram, "uWidth")},
        height: {loc: gl.getUniformLocation(shaderProgram, "uHeight")},
        sampler: {loc: gl.getUniformLocation(shaderProgram, "uSampler")},
        rules: {loc: gl.getUniformLocation(shaderProgram, "uRules")}
    };
    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    animateScene();
}

function mapResource(name) {
    resourcesRemaining += 1;
    return (data) => {
        resources[name] = data;
        resourcesRemaining -= 1;
        console.log(`${name} loaded, ${resourcesRemaining} remain`);
        if (resourcesRemaining == 0)
            main();
    };
}

function compileShader(code, type) {
    let shader = gl.createShader(type);
  
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function buildShaderProgram(shaderInfo) {
    let program = gl.createProgram();

    shaderInfo.forEach(function(sInfo) {
        let shader = compileShader(resources[sInfo.name], sInfo.type);

        if (shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking shader program:");
        console.info(gl.getProgramInfoLog(program));
    }

    return program;
}



//Load resources
$.get("frag.glsl", mapResource("frag"));
$.get("vertex.glsl", mapResource("vertex"));