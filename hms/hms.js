//Globals
var arrangement = null;
var container = $("#container");

//Templates for views
var template3D = $("#template-3d").children();
var templateMap = $("#template-map").children();
var templateStatusBar = $("#template-statusbar").children();

//Helper functions
function select(element) {
	$(element).parent().children().removeClass("selected");
	$(element).addClass("selected");
}
function arrange(which) {
	switch (which) {
		case 1:
			arrangement.close();
			arrangement = new ArrDefault();
			arrangement.init();
			break;
		case 2:
			arrangement.close();
			arrangement = new ArrDefault();
			arrangement.init();
			break;
		case 3:
			arrangement.close();
			arrangement = new ArrDefault();
			arrangement.init();
			break;
	
		default:
			break;
	}
}

//Classes
function View(init, close) {
	this.element = null;
	this.init = init;
	this.close = function () {
		console.log("not implemented");
	};
}
function Arrangement(init, close) {
	this.init = init;
	this.close = close;
	this.views = [];
	this.members = null;
}

//Views
function View3D() {
	View.call(this);
	this.animate = function () {
		requestAnimationFrame(this.animate.bind(this));
		this.renderer.render(this.scene, this.camera);
	};
	this.onresize = function (event) {
		var width = this.parent.width();
		var height = this.parent.height() - 48;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setViewport(width, height);
		this.renderer.setSize(width, height);
		this.camera.position.z = 2 * (width / innerWidth);
	};
	this.init = function (parent) {
		this.parent = $(parent);
		this.parent.append(template3D);
		this.element = this.parent.children();

		//ThreeJS setup
		var width = this.parent.width();
		var height = this.parent.height() - 48;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({
			alpha: true
		});
		this.renderer.setSize(width, height);
		this.parent.append(this.renderer.domElement);

		var loader = new THREE.OBJLoader();
		var callback = function (object) {
			this.scene.add(object);
			this.boat = object;
		};
		loader.load("boat.obj", callback.bind(this), null, console.error);

		var light = new THREE.DirectionalLight(0xffffff, 1.0);
		this.scene.add(light);
		var alight = new THREE.AmbientLight(0x202020, 1.0);
		this.scene.add(alight);

		this.camera.position.z = 2;
		this.camera.position.y = 0.4;

		//Setup orbit controls
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.maxPolarAngle = Math.PI / 2;

		this.animate();

		window.addEventListener("resize", this.onresize.bind(this));
	};
}
function ViewMap() {
	View.call(this);
	this.init = function (parent) {
		this.parent = $(parent);
		this.parent.append(templateMap);
		this.element = this.parent.children()[0];
	}
}
function ViewStatusBar() {
	View.call(this);
	this.init = function (parent) {
		this.parent = $(parent);
		this.parent.append(templateStatusBar);
		this.element = this.parent.children()[0];
	}
}

//Arrangements
function ArrDefault() {
	Arrangement.call(this);
	this.init = function () {
		container.append($("<div class='view half'>"));
		container.append($("<div class='view half'>"));
		container.append($("<div class='view bar'>"));
		this.members = $("#container .view");
		this.views.push(new View3D());
		this.views.push(new ViewMap());
		this.views.push(new ViewStatusBar());
		this.views[0].init(this.members[0]);
		this.views[1].init(this.members[1]);
		this.views[2].init(this.members[2]);
	}
	this.close = function () {
		container.children().remove();
		this.members = null;
		this.views[0].close();
		this.views[1].close();
		this.views[2].close();
		this.views.length = 0;
	}
}
ArrDefault.prototype = Object.create(Arrangement.prototype);

//Start
arrangement = new ArrDefault();
arrangement.init();

var established = false;
var wss = new WebSocket("ws://localhost");
wss.onopen = console.log;
wss.onerror = console.error;
wss.onclose = console.log;
wss.onmessage = function (data) {
	var message = data.data;

	//Handshake
	if (!established) {
		if (message == "handshake")
			wss.send("handshake client");
		else
			console.error("Unexpected message: ", message);
	}

	//Normal messages
	else {
		console.log(message);
	}
};
