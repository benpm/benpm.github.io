//Aliases
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

let width = 256;
let height = 256;

let info = document.getElementById("info");
let msg = document.getElementById("msg");
let b_friend = document.getElementById("b_friend");
let b_fast = document.getElementById("b_fast");
let b_better = document.getElementById("b_better");
let b_sacrifice = document.getElementById("b_sacrifice");
let b_salvation = document.getElementById("b_salvation");

//Create a Pixi Application
let app = new Application({
    width: width,
    height: height,
    backgroundColor: 0xFFFFFF,
    antialiasing: false,
    transparent: false
}
);


//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
console.log(app.view.getContext("2d"));

loader
    .add("man.png")
    .add("friend.png")
    .add("fairy.png")
    .add("tile.png")
    .load(setup);

//Define any variables that are used in more than one function
let man;

let started = false;
let tw = Math.floor(width / 8);
let th = Math.floor(height / 8);
let tiles = new Container();
let friends = new Container();
let fairies = new Container();
let leftinlayer = tw * th;
let layer = 0;
let squares = 0;
let friendspeed = 1;
let squares_multiplier = 1;
let better_friends = false;
let salvation = false;
let shrink = 1.0;
let flash = 2;
let flashcolor = "";
let messages = [
    "reveal what lies beneath",
    "reveal what lies beneath?",
    "reveal what lies beneath.",
    "reveal what lies",
    "reveal who lies",
    "liar.",
    "something lies beneath",
    "become what lies beneath",
    "hello",
    "yes, there is a point to all this",
    "you must find out for yourself...",
    "...or you can give up"
];
let messages_alt = [
    "you have angered the gods",
    "there is no hope left for you",
    "nothing can save your soul",
    "you are truly lost to the world",
    "goodbye, child"
];
let costs = {
    b_friend: 50,
    b_fast: 500,
    b_better: 2000,
    b_sacrifice: 2,
    b_salvation: 1000000
};
let colors = [
    0xFFFFFF
];
let buttons = {
    left: false, 
    right: false,
    up: false,
    down: false
};
for (let i = 0; i < 100; i+=1) {
    colors.push(chroma.hsl(((i % 6) / 6.0) * 360, 100, 100).num());
}

function buyFriend() {
    let friend = new Sprite(resources["friend.png"].texture);
    friend.x = 128;
    friend.y = 128;
    friend.vx = 0;
    friend.vy = 0;
    friend.anchor.set(0.4, 0.4);
    friends.addChild(friend);
    squares -= costs.b_friend;
    b_fast.style.display = "";
    costs.b_friend += 50;
    b_friend.innerText = `(${costs.b_friend}*) new friend`;
    flashcolor = "yellow";
    flash = 4;

    let snd = new Audio('buy.wav');
    snd.play();
}

function buyFast() {
    friendspeed += 0.5;
    squares -= costs.b_fast;
    if (better_friends == false)
        b_better.style.display = "";
    costs.b_fast *= 2;
    b_fast.innerText = `(${costs.b_fast}*) faster friends`;
    flashcolor = "blue";
    flash = 4;

    let snd = new Audio('buy.wav');
    snd.play();
}

function buyBetter(e) {
    squares -= costs.b_better;
    better_friends = true;
    b_better.style.display = "none";
    flashcolor = "red";
    flash = 4;

    let snd = new Audio('buy.wav');
    snd.play();
}

function buySalvation(e) {
    squares -= costs.b_salvation;
    salvation = true;
    document.body.style.background = "black";
    friends.children.length = 0;
    fairies.children.length = 0;
    document.getElementById("shop").style.display = "none";
    msg.innerText = "you have been saved.";
    msg.style.color = "white";

    let snd = new Audio('buy.wav');
    snd.play();
}

function sacrifice() {
    friends.children.slice(costs.b_sacrifice);
    msg.innerText = messages_alt[costs.b_sacrifice - 2];
    fairies.children.pop();
    if (costs.b_sacrifice == 6) {
        b_sacrifice.style.display = "none";
    }
    costs.b_sacrifice += 1;
    b_sacrifice.innerText = `(${costs.b_sacrifice}F) sacrifice`;
    flashcolor = "green";
    flash = 8;

    let snd = new Audio('buy.wav');
    snd.play();
}

function newlayer() {
    leftinlayer = tw * th;
    layer += 1;
    if (layer >= 4) {
        b_sacrifice.style.display = "";
    }
    if (layer >= 2) {
        newfairy();
    }
    msg.innerText = messages[layer];
    flashcolor = "black";
    flash = 16;
    let snd = new Audio('win.wav');
    snd.play();
}

function dig(x, y, i) {
    i = i ? i : 0;
    ix = clamp0(Math.floor(x - 1 + (i%3)), 255);
    iy = clamp0(Math.floor(y - 1 + (i/3)), 255);
    let t = tiles.children[Math.floor(iy * tw + ix)];
    if (!t) return;
    if (t.dug == layer) {
        t.dug += 1;
        t.tint = colors[t.dug];
        leftinlayer -= 1;
        squares += 1;
        if (leftinlayer == 0) {
            newlayer();
        }
        let blip = new Audio('p.wav');
        blip.play();
        return true;
    } else {
        if (i >= 9) return false;
        return dig(x, y, i + 1);
    }
}

function undig(x, y, i) {
    i = i ? i : 0;
    ix = clamp0(Math.floor(x - 1 + (i%3)), 255);
    iy = clamp0(Math.floor(y - 1 + (i/3)), 255);
    let t = tiles.children[Math.floor(iy * tw + ix)];
    if (!t) return;
    if (t.dug == layer + 1) {
        t.dug -= 1;
        t.tint = colors[t.dug];
        leftinlayer += 1;
        return true;
    } else {
        if (i >= 9) return false;
        return undig(x, y, i + 1);
    }
}

function setup() {

    //Create the `man` sprite 
    man = new Sprite(resources["man.png"].texture);
    man.anchor.set(0.4, 0.4);
    man.y = 128;
    man.x = 128;
    man.vx = 0;
    man.vy = 0;
    man.zIndex = 1;

    //Keyboard
    window.addEventListener("keydown", (e) => {
        buttons[e.key] = true;
    });
    window.addEventListener("keyup", (e) => {
        buttons[e.key] = false;
    });


    //tiles
    for (let y = 0; y < th; y += 1) {
        for (let x = 0; x < tw; x += 1) {
            var t = new Sprite(resources["tile.png"].texture);
            t.position.set(x * 8, y * 8);
            t.dug = 0;
            tiles.addChild(t);
        }
    }
    app.stage.addChild(tiles);
    app.stage.addChild(man);
    app.stage.addChild(friends);
    app.stage.addChild(fairies);
    tiles.zIndex = 0;

    //Start the game loop by adding the `gameLoop` function to
    //Pixi's `ticker` and providing it with a `delta` argument.
    //Any functions added to the `ticker` will be called 60 times per second.
    //This means that the `gameLoop` function (defined in the code ahead) will be updated
    //60 times per second. 
    app.ticker.add(delta => gameLoop(delta));
}

function clamp0(v, max) {
    return (v <= max && v > 0) * v + (v > max) * max;
}

function clamp(v, min, max) {
    return (v <= max && v >= min) * v + (v > max) * max + (v < min) * min;
}

function newfairy(x, y) {
    let fairy = new Sprite(resources["fairy.png"].texture);
    fairy.x = x || 128;
    fairy.y = y || 128;
    fairy.vx = 0;
    fairy.vy = 0;
    fairy.anchor.set(0.5, 0.5);
    fairies.addChild(fairy);
}

function gameLoop(delta) {
    let time = Date.now() / 100.0;
    info.innerText = `${squares}*`
    + `\nlayer ${layer}`
    + `\n${leftinlayer}/${tw * th}`
    + `\n${friends.children.length} friends`;
    if (buttons["ArrowUp"] || buttons["w"])
        man.vy = -1;
    else if (buttons["ArrowDown"] || buttons["s"])
        man.vy = 1;
    else
        man.vy = 0;
    if (buttons["ArrowLeft"] || buttons["a"])
        man.vx = -1;
    else if (buttons["ArrowRight"] || buttons["d"])
        man.vx = 1;
    else
        man.vx = 0;
    man.x = clamp(man.x + man.vx * delta, 2, 253);
    man.y = clamp(man.y + man.vy * delta, 2, 253);
    b_friend.disabled = (squares < costs.b_friend);
    b_fast.disabled = (squares < costs.b_fast);
    b_better.disabled = (squares < costs.b_better);
    b_sacrifice.disabled = (friends.children.length < costs.b_sacrifice);
    b_salvation.disabled = (squares < costs.b_salvation);
    if (man.vx != 0 || man.vy != 0)
        dig(man.x / 8, man.y / 8);
    for (let i = 0; i < friends.children.length; i += 1) {
        let friend = friends.children[i];
        if (Math.random() < 0.10) {
            while(dig(friend.x / 8, friend.y / 8) && better_friends) {};
            friend.vx = Math.random() * friendspeed * 2 - friendspeed;
            friend.vy = Math.random() * friendspeed * 2 - friendspeed;
            // r = Math.random();
        }
        friend.x = clamp(friend.x + friend.vx * delta, 2, 253);
        friend.y = clamp(friend.y + friend.vy * delta, 2, 253);
    }
    for (let i = 0; i < fairies.children.length; i += 1) {
        let fairy = fairies.children[i];
        if (Math.random() < 0.01) {
            fairy.vx = Math.random() * 2 - 1;
            fairy.vy = Math.random() * 2 - 1;
            undig(fairy.x / 8, fairy.y / 8);
        }
        fairy.x = clamp(fairy.x + fairy.vx * delta, 2, 253);
        fairy.y = clamp(fairy.y + fairy.vy * delta, 2, 253);
    }
    if (salvation) {
        shrink *=  0.999;
        app.view.style.transform = `scale(${shrink})`
    }
    if (flash == 1) {
        document.body.style.background = "white";
        flash = 0;
    }
    if (flash >= 2) {
        document.body.style.background = flash % 2 ? flashcolor : "white";
        flash -= 1;
    }
}
