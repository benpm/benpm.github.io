var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d", {alpha: false});
const $title = $("#title");
const touch = new Hammer(document.body);

var balls = [];
var colors = [
    "#6F8897",
    "#83DBE2",
    "#E0D2CE",
    "#FBF7F2"
];
var clearColor = [0, 0, 0];
var t = 0;
var dtball = t;
var clickInterval = null;
var mx = 0;
var my = 0;

function Ball(x, y, vx, vy, size, color, decay) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.decay = decay;
}

function resizeHandler() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function mouseHandler(e) {
    mx = e.clientX;
    my = e.clientY;
}

function touchHandler(e) {
    mx = e.center.x;
    my = e.center.y;
    if (t - dtball > 0.1) {
        clickHandler();
        dtball = t;
    }
}

function clickHandler() {
    //if (balls.length > 100) balls.shift();
    var radius = Math.random() * 100;
    var ball = new Ball(
        mx - radius / 2.0, my - radius / 2.0,
        (0.5 - Math.random()) * 2, (0.5 - Math.random()) * 2,
        radius, chance.pickone(colors), 1 + Math.random() * 0.1);
    balls.push(ball);
}

function drawBall(ball, index, arr) {
    ball.size /= ball.decay;
    if (ball.size < 1.0)
        return false;
    ball.vx += Math.sin(t + ball.x / 100.0) * 0.05;
    ball.vy += Math.cos(t + ball.y / 100.0) * 0.05;
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) ball.vx = -ball.vx;
    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) ball.vy = -ball.vy;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    return true;
}

function loop() {
    ctx.fillStyle = "rgba(62,54,57,0.01)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    balls = balls.filter(drawBall);
    $title.text(balls.length);
    t += 1 / 60;
}

$("body").on("click", clickHandler);
$("body").on("mousemove", mouseHandler);
touch.on("pan", touchHandler);
touch.on("tap", touchHandler);
resizeHandler();
ctx.fillStyle = "#3E3639";
ctx.fillRect(0, 0, canvas.width, canvas.height);
mx = canvas.width / 2;
my = canvas.height / 2;
for (i = 0; i < 10; i++) {
    clickHandler();
}
setInterval(loop, 1000 / 60);
//setInterval(clickHandler, 500);