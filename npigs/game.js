// https://coolors.co/000000-14213d-fca311-e5e5e5-ffffff


//Globals
var pigs = [], friends = [], pigGroup, crown, ground, cursors, pushables,
	current, currentIndex = 1, keyNew, keySwap, keyPause, lastPlat, maxJumps = 2,
	scoretext, stones, clouds, lowpig, platforms, deco, menu;
var score = 0;
var best = 0;
var allplats = ["p1", "p2", "p3", "p4", "p5", "p6"];
var decorations = ["bg1", "bg2", "bg3"];
var plats = ["p1", "p2"];
var SCALE = 4;
var boundLeft = 0;
var boundRight = 1000;
var GRAVITY = 2000;
var loadProgress = document.getElementById("progress");
var lastSentScore = 15;
var scoreBoard;
var username = "";
var menu = document.getElementById("menu");
var loseScreen = document.getElementById("lose");
var namebox = document.getElementById("namebox");
var yourBest = document.getElementById("best");
var board = document.getElementById("scores").children[0];
var fallsound;
var maxFall = 120;
var music;


//Send score to IFTTT
function sendScore() {
	if (best <= lastSentScore)
		return;	
	var url = "https://maker.ifttt.com/trigger/npigs/with/key/dMvIEBpoWgEJpP2eyJj6FP?value1=" + best + "&value2=" + username;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.send();
	lastSentScore = best;
}

//Get score
function getScores(endFunction) {
	var url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUQjopD6IN1urwIhPLh5xHgGQFefSSy8C10iPPXET24Lgp8_uvMiDfvCj8v9zrBbgOZ3UXCaSJ3yuJ/pub?gid=372025323&single=true&output=csv";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.send();
	xhr.addEventListener("load", (d) => {
		scoreBoard = [];
		for (row of Papa.parse(xhr.response).data) {
			scoreBoard.push([row[1], parseInt(row[0])]);
		}
		endFunction();
	});
}

//Handler for loading progress
function loadHandler(progress, key, url) {
	console.log("Loading", key, progress);
	loadProgress.innerText = progress + " PIGS LOADED";
}

//Handler for window resizing
function windowResize() {
	if (innerHeight + innerWidth < 2000)
		SCALE = 3;
	else if (innerHeight + innerWidth < 4000)
		SCALE = 4;
	else
		SCALE = 5;	
	game.scale.setGameSize(window.innerWidth / SCALE, window.innerHeight / SCALE);
}

//Returns a random integer
function rint(min, max) {
	return chance.integer({ min: min, max: max });
}

//Clamps a number
function clamp(x, min, max) {
	return Math.max(Math.min(x, max), min);
}

//Adds a new pushable
function addPushable(x, y, name) {
	var p = pushables.create(x, y, name);
	p.anchor.set(0.5, 1);
	game.physics.arcade.enable(p);
	p.body.gravity.y = GRAVITY;
	return p;
}

//Adds a new pig
function addPig(x, y) {
	player = pigGroup.create(x, y, "player");
	pigs.push(player);
	game.physics.arcade.enable(player);
	player.body.bounce.x = 0.1;
	player.body.bounce.y = 0.1;
	player.body.gravity.y = GRAVITY;
	player.jumps = 0;
	player.falling = 0;
	return player;
}

//Adds a new platform randomly to the top of the tower
function addPlatform(params) {
	//Choose random position
	var x, y;
	while (true) {
		x = lastPlat ? lastPlat.x + (chance.pickone([1, -1]) * rint(50, 200)) : boundRight / 2;
		y = lastPlat ? lastPlat.y - rint(30, 90) : -70;
		if (x > boundLeft + 100 && x < boundRight - 100)
			break;	
	}

	//Create random platform with intermittent stone
	lastPlat = platforms.create(x, y,
		chance.pickone(plats));
	lastPlat.body.immovable = true;

	//Decide if too small for additional stuff
	var toosmall = false;
	if (lastPlat.width < 40)
		toosmall = true;	
	
	//Additional stone
	if (!toosmall && platforms.count() % 12 == 0)
		addStone(lastPlat.x + Math.floor(lastPlat.width / 2), lastPlat.y);

	//Pushable
	if (!toosmall && chance.bool({likelihood: 3}))
		addPushable(lastPlat.x + Math.floor(lastPlat.width / 2), lastPlat.y, "crate");

	//The occasional cloud
	if (chance.bool())
		addCloud(y - 600);
	
	//Some stuff
	if (!toosmall && chance.bool({ likelihood: 15 }))
		addDeco(lastPlat.x + rint(6, lastPlat.width - 6), lastPlat.y);

	//Slowly add new platform types
	if (lastPlat.y < -1000)
		plats = allplats.slice(0, 2);
	if (lastPlat.y < -2000)
		plats = allplats.slice(0, 3);
	if (lastPlat.y < -5000)
		plats = allplats.slice(0, 4);
	if (lastPlat.y < -6000)
		plats = allplats.slice(0, 5);
	if (lastPlat.y < -7500)
		plats = allplats.slice(0, 6);
}

//Adds a stone to the specified position
function addStone(x, y) {
	var stone = stones.create(x, y, "stone");
	stone.anchor.set(0.5, 1);
	return stone;
}

//Adds a cloud
function addCloud(y) {
	var n = clouds.create(rint(boundLeft, boundRight), y,
		chance.pickone(["cloud1", "cloud2", "cloud3", "cloud4",
			"cloud5", "cloud6", "cloud7", "cloud8"]));
	return n;
}

//Adds a random decoration
function addDeco(x, y) {
	deco.create(x, y, chance.pickone(decorations)).anchor.set(0.5, 1);
}

//Swaps to the next pig in the pig list
function swap() {
	currentIndex += 1;
	current = pigs[currentIndex % pigs.length];
	current.addChild(crown);
	game.camera.shake(0.002, 100);
}

//Death
function lose() {
	sendScore();
	fallsound.fadeOut(250);
	music.fadeOut(1000);
	game.sound.play("lose", 1);
	loseScreen.style.display = "";
	loseScreen.style.animation = "flash 2s";
	document.getElementById("finalscore").innerText = `YOUR FINAL SCORE WAS ${best}`;
}

//Converts y position to scoring height
function scoring(ypos) {
	return Math.floor(-ypos / 50);
}

//Update and show leaderboard
function updateScores() {
	var i = 0;
	board.innerHTML = "<tbody><tr><th>POSITION</th><th>NAME</th><th>SCORE</th></tr>";
	for (row of scoreBoard) {
		i += 1;
		board.innerHTML += `<tr><td>${i}</td><td>${row[0]}</td><td>${row[1]}</td></tr>`;
	}
	board.innerHTML += "</tbody>";
}

//Toggle pause menu
function togglePause() {
	username = namebox.value || "PLAYER";
	yourBest.innerText = `${username}'S BEST: ${best}`;
	if (game.paused) {
		game.paused = false;
		menu.style.display = "none";
	} else {
		game.paused = true;
		menu.style.display = "";
	}
}

//Game loading handler
function preload(params) {
	//Loading visual progress
	game.load.onFileStart.add(loadHandler);

	//Sprites
	game.load.image("stone", "assets/stone.png");
	game.load.image("player", "assets/player.png");
	game.load.image("platform", "assets/platform.png");
	game.load.image("crate", "assets/crate.png");
	game.load.image("crown", "assets/crown.png");
	game.load.image("logo", "assets/logo.png");
	game.load.image("sign", "assets/sign.png");
	game.load.image("p1", "assets/p1.png");
	game.load.image("p2", "assets/p2.png");
	game.load.image("p3", "assets/p3.png");
	game.load.image("p4", "assets/p4.png");
	game.load.image("p5", "assets/p5.png");
	game.load.image("p6", "assets/p6.png");
	game.load.image("bg1", "assets/bg1.png");
	game.load.image("bg2", "assets/bg2.png");
	game.load.image("bg3", "assets/bg3.png");
	game.load.image("cloud1", "assets/cloud1.png");
	game.load.image("cloud2", "assets/cloud2.png");
	game.load.image("cloud3", "assets/cloud3.png");
	game.load.image("cloud4", "assets/cloud4.png");
	game.load.image("cloud5", "assets/cloud5.png");
	game.load.image("cloud6", "assets/cloud6.png");
	game.load.image("cloud7", "assets/cloud7.png");
	game.load.image("cloud8", "assets/cloud8.png");
	game.load.image("tower", "assets/tower.png");
	game.load.image("menu", "assets/menu.png");
	game.load.image("selector", "assets/selector.png");
	game.load.image("dot", "assets/dot.png");

	//Audio
	game.load.audio("music", "assets/music.mp3");
	game.load.audio("jump", "assets/jump.wav");
	game.load.audio("jump2", "assets/jump2.wav");
	game.load.audio("jump3", "assets/jump3.wav");
	game.load.audio("hit", "assets/hit.wav");
	game.load.audio("pig", "assets/pig.wav");
	game.load.audio("swap", "assets/swap.wav");
	game.load.audio("fall", "assets/fall.wav");
	game.load.audio("lose", "assets/lose.wav");
	game.load.audio("die", "assets/die.wav");

	//Fonts
	game.load.bitmapFont("pix", "assets/pix.png", "assets/pix.fnt");

	//Image setup
	Phaser.Canvas.setImageRenderingCrisp(game.canvas);
}

//Game creation handler
function create(params) {

	//Background elements
	game.stage.backgroundColor = 0x14213D;
	
	//Groups
	deco = game.add.group();
	deco.update = function () { };
	clouds = game.add.group();
	clouds.update = function () { };
	pigGroup = game.add.group();
	stones = game.add.group();
	platforms = game.add.group();
	platforms.enableBody = true;
	pushables = game.add.group();
	pushables.enableBody = true;

	//Decorations
	for (var i = 0; i < 30; i++) {
		addDeco(rint(boundLeft - 500, boundRight + 500), 0);
	}
	deco.create(50, 0, "logo").anchor.set(0.5, 1);
	deco.create(250, 0, "sign").anchor.set(0.5, 1);
	deco.create(600, 0, "tower").anchor.set(0.5, 1);

	//Help text
	game.add.bitmapText(50, -130, "pix", `
	ARROWKEYS - MOVE
	SPACEBAR - SWAP
	MOVE ALL YOUR PIGS UPWARDS TO GET POINTS
	MORE PIGS, MORE POINTS...
	OH YEAH YOU CAN DOUBLE JUMP AND JUMP IN MID-AIR`, -5);

	//Game elements
	fallsound = game.add.audio("fall", 0.75);
	game.physics.startSystem(Phaser.Physics.ARCADE);
	crown = game.add.sprite(0, 0, "crown");
	crown.position.set(0, -8);
	indicator = game.add.sprite(0, 0, "dot");
	indicator.position.set(5, -14);
	addPig(150, -20);
	swap();
	addStone(300, 0);

	//Platforms
	for (var i = 0; i < 10; i++) {
		addPlatform();
	}

	//Foreground
	scoretext = game.add.bitmapText(0, -50, "pix", "", -5);

	//Ground
	ground = platforms.create(0, 0, "platform");
	ground.scale.set(200, 8);
	ground.position.x = -400;
	ground.body.immovable = true;

	//Renderer / views
	game.renderer.autoResize = true;
	game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
	game.scale.parentIsWindow = true;
	game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

	//Input
	cursors = game.input.keyboard.createCursorKeys();
	wasd = game.input.keyboard.addKeys( { 
		"up": Phaser.KeyCode.W, 
		"down": Phaser.KeyCode.S, 
		"left": Phaser.KeyCode.A, 
		"right": Phaser.KeyCode.D } );
	keyNew = game.input.keyboard.addKey(Phaser.Keyboard.N);
	keySwap = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	keyPause = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

	//Music
	music = game.sound.play("music", 1, true);

	//Prompt
	/* do {
		username = prompt(username ? "Invalid! Alphanumeric, between 2 and 7 characters only!" : "Enter a name for the score board!");
	}
	while (username.length < 8 && username.length > 1 && (/\W/g).test(username)) */
	username = "test";

	//Remove loading screen
	document.getElementById("loading").style.display = "none";
	menu.style.display = "";

	togglePause();
	windowResize();
	game.world.pivot.set(0, 400);
	game.input.keyboard.clearCaptures();
}

//Game frame update handler
function update(params) {
	if (pigs.length == 0)
		return;

	var lastlow = lowpig;
	score = scoring(current.y);

	lowpig = current;

	game.physics.arcade.collide(pigGroup, platforms);
	game.physics.arcade.collide(pigGroup, pigGroup);
	game.physics.arcade.collide(pigGroup, pushables);
	game.physics.arcade.collide(pushables, platforms);

	for (var i = pigs.length - 1; i >= 0; i--) {

		var p = pigs[i];

		p.body.velocity.x = clamp(p.body.velocity.x, -200, 200);
		if (p.y > -15)
			p.y = -16;
		p.x = clamp(p.x, boundLeft, boundRight);
		p.body.velocity.y = clamp(p.body.velocity.y, -1000, 1000);

		//Death
		if (p.body.velocity.y < 10 && p.falling > maxFall) {
			p.removeChildren();
			p.destroy();
			pigs.splice(i, 1);
			game.sound.play("die", 1);
			game.camera.flash(0xfca311, 500, true);
			continue;
		}

		if (p.body.velocity.y > 900)
			p.falling += 1;
		else
			p.falling = 0;	

		if (scoring(p.y) < score)
			score = scoring(p.y);
		
		if (p !== current)
			p.body.velocity.x /= 1.3;
		
		if (p.y > lowpig.y + 1)
			lowpig = p;	
	}

	//Falling noise
	if (current.falling > 0) {
		if (!fallsound.isPlaying)
			fallsound.play();
	} else {
		if (fallsound.isPlaying)
			fallsound.stop();
	}

	//Death check
	if (!current.alive) {
		if (pigs.length > 0) {
			currentIndex = 0;	
			swap();
		}
		else {
			lose();
			return;
		}
	}

	//Dot pig
	if (lowpig !== lastlow) {
		lowpig.addChild(indicator);
	}

	//Correct score
	score *= pigs.length;

	//Simulate pushables
	for (p of pushables.getAll()) {
		p.body.velocity.y = clamp(p.body.velocity.y, -1000, 1000);
		p.body.velocity.x /= 1.3;
		if (p.body.velocity.y > 800 &&p.y > game.world.pivot.y + 500) {
			p.y = lastPlat.y;
			p.x = rint(boundLeft, boundRight);
			if (pushables.count() > 10)
				p.destroy()
		}
	}

	//Simulate clouds
	for (cloud of clouds.getAll()) {
		cloud.x = 200 + Math.floor(Math.sin(cloud.y + game.time.now / 50000) * 600);
	}

	//Best score
	if (score > best)
		best = score;
	
	//Reset jumps count
	if (current.body.touching.down) {
		if (current.jumps != maxJumps)
			game.sound.play("hit", 0.5);
		current.jumps = maxJumps;
	}

	//Player controls
	if (cursors.left.isDown || wasd.left.isDown) {
		current.body.velocity.x -= 100;
	} else if (cursors.right.isDown || wasd.right.isDown) {
		current.body.velocity.x += 100;
	} else {
		current.body.velocity.x /= 2;
	}

	//Jump
	if ((cursors.up.justPressed() || wasd.up.justPressed()) && current.jumps > 0) {
		current.body.velocity.y = -500;
		current.jumps -= 1;	
		game.sound.play(["jump", "jump2", "jump3"][clamp(current.jumps, 0, 2)], 0.75);
	}

	//Stones collision
	for (stone of stones.getAll()) {
		if (game.math.distance(current.x, current.y, stone.x - 10, stone.y - 15) < 20) {
			stone.destroy();
			addPig(stone.x - 10, stone.y - 16).body.velocity.y = -500;
			currentIndex = pigs.length - 2;
			game.sound.play("pig", 0.75);
			break;
		}
	}

	//Camera
	game.world.pivot.set(
		Math.floor(current.x - game.width / 2),
		Math.floor(current.y - game.height / 2));

	//Swap
	if (keySwap.justPressed()) {
		swap();
		game.sound.play("swap", 0.75);
	}
	
	//New platforms
	if (current.y < lastPlat.y + 200)
		addPlatform();	
	
	//Cull platforms
	if (platforms.count() > 20) {
		var first = platforms.getFirstDead();
		if (first && first.y < lowpig.y + 250)
			first.revive();	
		first = platforms.getFirstAlive();
		if (first.y > lowpig.y + 500)
			first.kill();
	}
	
	//Score text
	scoretext.position.x = game.world.pivot.x + 4;
	scoretext.position.y = game.world.pivot.y;
	scoretext.text = `${score / pigs.length} X ${pigs.length} = ${score} ... (${best})`;

	if (keyPause.justPressed())
		togglePause();	
}


//Add window resizing listener
window.addEventListener("resize", _.throttle(windowResize, 500));
setInterval(sendScore, 20000);

//Begin Phaser game
var game = new Phaser.Game(window.innerWidth / SCALE, window.innerHeight / SCALE, Phaser.AUTO, "", {
	preload: preload,
	create: create,
	update: update
}, false, false);
