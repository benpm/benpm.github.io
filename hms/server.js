//Requirements
const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const Chance = require('chance');
const WebSocketServer = require('ws').Server;

//Globals
var serve = serveStatic("./");
var chance = new Chance();

var server = http.createServer(function (req, res) {
	var done = finalhandler(req, res);
	serve(req, res, done);
});

//WebSocket server
var wss = new WebSocketServer({ server: server });
var clients = {};
var sensors = {};

function receiveMessage(msg) {
	var parts = msg.split(" ");
	var key = parts[0];
	var value = parts[1];

	//Handshake over user connection
	if (key == "handshake" && !this.established) {
		var id = chance.string({ length: 8 });
		switch (value) {
			case "client":
				clients[id] = this;
				break;
			case "sensor":
				sensors[id] = this;
				break;
			default:
				console.error("Unknown user type", value);
				return;
		}
		this.connType = value;
		this.established = true;
		this.identifier = id;
		this.send("handshake");
		console.log(this.identifier, "connected");
	}

	//Normal messages
	if (key != "handshake" && this.established) {
		console.log(msg);
	}
}

wss.on("connection", (ws) => {
	ws.established = false;
	ws.send("handshake");

	ws.on("message", receiveMessage);
	ws.on("error", console.error);
	ws.on("close", () => {
		console.log(ws.identifier, "disconnected");
	})
});

server.listen(80);
