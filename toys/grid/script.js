var canvas = document.getElementById("drawing");
var c = canvas.getContext("2d");
var scaleFrac = 8;
var cells = null;
var colors = ["#4f6d7a", "#c0d6df"];
var rules = [[0, 0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 1, 0, 0, 0, 0, 0]];

function onResize(e) {
    canvas.width = window.innerWidth / scaleFrac;
    canvas.height = window.innerHeight / scaleFrac;
    c.fillStyle = colors[0];
    c.fillRect(0, 0, canvas.width, canvas.height);
    cells = new Uint8Array(canvas.width * canvas.height);
    start();
}

function set(x, y, val) {
    c.fillStyle = colors[val];
    c.fillRect(x, y, 1, 1);
    cells[y * canvas.width + x] = val;
}

function get(x, y, color) {
    return cells[y * canvas.width + x];
}

function start() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            if (Math.random() < 0.1) set(x, y, 1);
        }
    }
}

function sim() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            n = 0; val = get(x, y);
            for (let ix = -1; ix < 2; ix++) {
                for (let iy = -1; iy < 2; iy++) {
                    n += get(x + ix, y + iy);
                }
            }
            newval = rules[val][n];
            if (newval != val)
                set(x, y, newval);
        }
    }
    window.requestAnimationFrame(sim);
}

window.addEventListener("resize", onResize);
onResize();
window.requestAnimationFrame(sim);



