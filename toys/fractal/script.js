'use strict';

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
var resources = {};
var resourcesRemaining = 0;
var flip = false;
var shaderProgram, uniforms, aVertexPosition, vertexBuffer, image, gui, mvx, mvy, mx, my, lmouse, rmouse, zoom;
const dpr = 1;
const rules = new Int32Array([
    0, 0, 0, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0
]);
const blending = gl.LINEAR;
const edgeBehavior = gl.REPEAT;
const parameters = {
    shader: "fractal",
    param1: 2.0,
    param2: 4.0,
    iterations: 50.0,
    pause: false
};
const shaderSet = { 
    fractal: "fractal"
};

function lerp(a, b, v) {
    return a + (b - a) * v;
}

function mouseHandler(e) {
    if (lmouse) {
        uniforms.view.val[0] = mvx - ((e.pageX - mx) / uniforms.view.val[2] / canvas.width);
        uniforms.view.val[1] = mvy - ((e.pageY - my) / uniforms.view.val[2] / canvas.height);
    }
}

function clickOn(e) {
    mvx = uniforms.view.val[0];
    mvy = uniforms.view.val[1];
    mx = e.pageX;
    my = e.pageY;
    lmouse = true;
}

function clickOff(e) {
    lmouse = false;
}

function onZoom(e) {
    let direction = e.originalEvent.deltaY;
    if (direction > 0)
        zoom /= 1.25;
    else
        zoom *= 1.25;
}

function onResize(e) {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
}

//Render to the screen
function animateScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);

    //Set uniforms
    uniforms.time.val += 0.01;
    uniforms.view.val[2] = lerp(uniforms.view.val[2], zoom, 0.25);
    gl.uniform1f(uniforms.time.loc, uniforms.time.val);
    gl.uniform1f(uniforms.width.loc, canvas.width);
    gl.uniform1f(uniforms.height.loc, canvas.height);
    gl.uniform1f(uniforms.param1.loc, uniforms.param1.val);
    gl.uniform1f(uniforms.param2.loc, uniforms.param2.val);
    gl.uniform1f(uniforms.iterations.loc, uniforms.iterations.val);
    gl.uniform4fv(uniforms.view.loc, uniforms.view.val);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    //Flip framebuffers
    if (!parameters.pause) window.requestAnimationFrame(animateScene);
}

//Setup for WebGL stuff
function webGlSetup() {
    //Shaders
    const shaderSet = [
        {type: gl.FRAGMENT_SHADER, name: parameters.shader},
        {type: gl.VERTEX_SHADER, name: "vertex"}
    ];
    shaderProgram = buildShaderProgram(shaderSet);

    //Create vertices for quad
    var vertexArray = vertexArray || new Float32Array([
        -1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, -1.0, -1.0
    ]);
    vertexBuffer = vertexBuffer || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    //Uniforms
    uniforms = {
        time: {loc: gl.getUniformLocation(shaderProgram, "uTime"), val: 0},
        width: {loc: gl.getUniformLocation(shaderProgram, "uWidth")},
        height: {loc: gl.getUniformLocation(shaderProgram, "uHeight")},
        param1: {loc: gl.getUniformLocation(shaderProgram, "uParam1"), val: 2.0},
        param2: {loc: gl.getUniformLocation(shaderProgram, "uParam2"), val: 4.0},
        iterations: {loc: gl.getUniformLocation(shaderProgram, "uIterations"), val: 50.0},
        view: {loc: gl.getUniformLocation(shaderProgram, "uView"), val: [0, 0, 0.25, 0]}
    };
    zoom = uniforms.view.val[2];

    //Attributes
    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.useProgram(shaderProgram);
}

//Main function
function main() {
    //Check if WebGL2 is available
    if (gl == null) {
        console.error("Unable to initialize WebGL 2 context");
        return;
    }

    webGlSetup();
    
    //GUI
    gui = new dat.GUI();
    let controller = gui.add(parameters, "param1", -5.0, 5.0);
    controller.onChange(() => {uniforms.param1.val = parameters.param1});
    controller = gui.add(parameters, "param2", -5.0, 5.0);
    controller.onChange(() => {uniforms.param2.val = parameters.param2});
    //controller = gui.add(parameters, "iterations", 1.0, 200.0);
    //controller.onChange(() => {uniforms.iterations.val = parameters.iterations});

    //Handlers
    $(canvas).on("mousemove", mouseHandler);
    $(canvas).on("mousedown", clickOn);
    $(canvas).on("mouseup", clickOff);
    $(window).on("wheel", onZoom);
    $(window).on("resize", onResize);

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

//Restart
function restart() {
    uniforms.time.val = 0.0;
}



//Load resources
onResize();
Object.keys(shaderSet).forEach((shaderName) => {
    $.get(shaderName + ".glsl", mapResource(shaderName));
});
$.get("vertex.glsl", mapResource("vertex"));