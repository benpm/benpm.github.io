'use strict';

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
var resources = {};
var resourcesRemaining = 0;
var flip = false;
var shaderProgram, uniforms, aVertexPosition, vertexBuffer, dataTex, targetTex, fbA, fbB, image;
const rules = new Int32Array([
    0, 0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0
]);
const useShader = "gol";
const blending = gl.LINEAR;
const imageName = "tree.png";
const edgeBehavior = gl.REPEAT;

function mouseHandler(e) {
    uniforms.mouse.val[0] = (e.pageX / window.innerWidth);
    uniforms.mouse.val[1] = (e.pageY / window.innerHeight);
}

function clickOn(e) {
    uniforms.mouse.val[2] = 1;
}

function clickOff(e) {
    uniforms.mouse.val[2] = 0;
}

//Render to the screen
function animateScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Set uniforms
    uniforms.time.val += 0.01;
    gl.uniform1f(uniforms.time.loc, uniforms.time.val);
    gl.uniform1f(uniforms.width.loc, canvas.width);
    gl.uniform1f(uniforms.height.loc, canvas.height);
    gl.uniform1i(uniforms.sampler.loc, 0);
    gl.uniform4fv(uniforms.mouse.loc, uniforms.mouse.val);

    //Render to framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, flip ? fbB : fbA);
    gl.bindTexture(gl.TEXTURE_2D, flip ? targetTex : dataTex);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //Render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, targetTex);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //Flip framebuffers
    flip = !flip;
    window.requestAnimationFrame(animateScene);
}

//Main function
function main() {
    //Check if WebGL2 is available
    if (gl == null) {
        console.error("Unable to initialize WebGL 2 context");
        return;
    }

    //Initial texture from image
    dataTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dataTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, edgeBehavior);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, edgeBehavior);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, blending);

    //First framebuffer
    fbB = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dataTex, 0);
    
    //Destination texture
    targetTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, edgeBehavior);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, edgeBehavior);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, blending);

    //Second framebuffer
    fbA = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbA);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);

    //Shaders
    const shaderSet = [
        {type: gl.FRAGMENT_SHADER, name: useShader},
        {type: gl.VERTEX_SHADER, name: "vertex"}
    ];
    shaderProgram = buildShaderProgram(shaderSet);

    //Create vertices for quad
    var vertexArray = new Float32Array([
        -1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, -1.0, -1.0
    ]);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    //Uniforms
    uniforms = {
        time: {loc: gl.getUniformLocation(shaderProgram, "uTime"), val: 0},
        width: {loc: gl.getUniformLocation(shaderProgram, "uWidth")},
        height: {loc: gl.getUniformLocation(shaderProgram, "uHeight")},
        sampler: {loc: gl.getUniformLocation(shaderProgram, "uSampler")},
        mouse: {loc: gl.getUniformLocation(shaderProgram, "uMouse"), val: [0, 0, 0, 0]}
    };

    //Attributes
    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.activeTexture(gl.TEXTURE0);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.useProgram(shaderProgram);

    //Handlers
    $(document.body).on("mousemove", mouseHandler);
    $(document.body).on("mousedown", clickOn);
    $(document.body).on("mouseup", clickOff);

    animateScene();
}

//Returns a handler for this resource for onload or similar
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

//Compile a shader from given code and gl shader type
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

//Build the shader program from given shader informations
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
$.get(useShader + ".glsl", mapResource(useShader));
$.get("vertex.glsl", mapResource("vertex"));
image = new Image();
image.src = imageName;
image.onload = mapResource("tree");