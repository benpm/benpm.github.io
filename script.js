var currentNav = null;

//User info handler
function userInfoHandler(data) {
	console.log(data);
	$.post("https://maker.ifttt.com/trigger/visit/with/key/dMvIEBpoWgEJpP2eyJj6FP?value1=" + data.ip +
		"&value2=" + data.city +
		"&value3=" + data.region + ", " + data.country_name);
}

//Display navigation
function navOn(event) {
	let element = $(event.currentTarget);
	element.append($drop);
	currentNav = element;
	$drop.show();
	//$drop.css("animation", "drop 0.2s");
	$("#dropdown a").hide();
	$("#nav .cat").data("selected", "false").css("text-decoration", "");
	$drop.children("." + event.currentTarget.innerText).show();
	element.css("text-decoration", "underline");
}

//Hide navigation
function navOff(event) {
	let element = $(event.currentTarget);
	element.remove("#dropdown");
	$drop.hide();
	//$drop.css("animation", "");
	$("." + element.text()).hide();
	element.css("text-decoration", "");
}

//Toggle navigation
function navToggle(event) {
	let element = $(event.currentTarget);
	let state = element.data("selected");
	if (state == "false") {
		navOn(event);
		element.data("selected", "true");
	} else {
		navOff(event);
		element.data("selected", "false");
	}
	
}

//Navigation structure
const pageTree = {
	projects: [
		"forest",
		"easypin",
		"new_soils",
		"paperlike",
		"p5_experiments"
	],
	journal: [
		"11_4_2018",
		"1_29_2019"
	],
	art: [
		"gallery"
	],
	archive: [
		"old_stuff"
	],
	toys: [
		"index"
	],
	music: [
		"trope"
	],
	portfolio: [
		"portfolio"
	]
};

const nav = $("#nav");
const navLinks = $("#nav a");
const root = window.location.origin;
const title = $("title").text();

//Construct pagetree
const $drop = $("<span>", { id: "dropdown" });
for (const category in pageTree) {
	const $category = $("<span>", {
		class: "item cat",
		text: category
	});
	$category.data("selected", "false");
	nav.prepend($category);
	for (const page of pageTree[category]) {
		$drop.append($("<a>", {
			style: "display: none;",
			class: "item nested " + category,
			text: page,
			href: `${root}/${category}/${page}.html`
		}));
	}
	$category.on("click", navToggle);
}

//Home navigation button
nav.prepend($("<a>", {
	href: root
}).append($("<img>", {
	src: "../img/frac_light.png"
})))

//Current page
nav.append($("<span>", {
	id: "title"
}).text(title));

//Hide the dropdown nav menu
$drop.hide();

//Visit
$.get("https://api.ipdata.co/?api-key=8f4dce134d909add3349e13f6079409916dc2b3ceefecdd7029b72a4", userInfoHandler);
